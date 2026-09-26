import { fail, ok, preflight } from '../_shared/respond.ts';
import { assertAdminCode, AuthError, context, normalisePhone, serviceClient } from '../_shared/context.ts';

/**
 * POST /functions/v1/moderation
 *   { action: 'report', targetPhone?, groupId?, messageId?, reason }
 *   { action: 'queue', state?, limit? }          // admin
 *   { action: 'restrict', phone, kind, reason?, untilMs?, } // admin
 *   { action: 'lift', phone, kind }              // admin
 *   { action: 'purge-user', phone }              // admin + FOX_ADMIN_CODE
 *   { action: 'my-status' }                      // any user: renders the restriction banner
 *
 * Every admin action is additionally recorded in app.audit_log with the acting phone.  A normal
 * user has no write path to app.user_restriction at all (migration 0005), so "unban myself" is
 * not a thing a patched client can do.
 */
Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(b.action ?? '');
  try {
    const ctx = context(req, { admin: ['queue', 'restrict', 'lift', 'purge-user'].includes(action) });
    const admin = serviceClient();

    if (action === 'report') {
      const reason = String(b.reason ?? '').trim();
      if (reason.length < 3 || reason.length > 300) return fail('reason', 'دلیل گزارش بین ۳ تا ۳۰۰ نویسه باشد');
      const target = b.targetPhone ? normalisePhone(b.targetPhone as string) : null;
      if (target === ctx.phone) return fail('self', 'گزارش خود مجاز نیست');
      const { error } = await ctx.user.from('report').insert({
        reporter_phone: ctx.phone,
        target_phone: target,
        group_id: b.groupId ? String(b.groupId) : null,
        target_message: b.messageId ? String(b.messageId) : null,
        reason,
      });
      if (error) return fail('report', 'ثبت گزارش ناموفق بود', 400);
      return ok({ reported: true }, 201);
    }

    if (action === 'my-status') {
      const { data } = await ctx.user.rpc('current_restriction').maybeSingle();
      return ok({ restriction: data ?? null, serverTime: Date.now() });
    }

    if (action === 'queue') {
      const state = ['new', 'reviewed', 'actioned', 'rejected'].includes(String(b.state)) ? String(b.state) : 'new';
      const limit = Math.min(200, Math.max(1, Number(b.limit ?? 50)));
      const { data, error } = await ctx.user.from('report')
        .select('*,reporter:reporter_phone(name,username),target:target_phone(name,username)')
        .eq('state', state).order('created_at', { ascending: false }).limit(limit);
      if (error) return fail('queue', 'خطا در دریافت گزارش‌ها', 500);
      return ok({ reports: data ?? [], state });
    }

    if (action === 'restrict') {
      const phone = normalisePhone(b.phone as string);
      const kind = b.kind === 'mute' ? 'mute' : 'ban';
      const until = b.untilMs ? new Date(Number(b.untilMs)).toISOString() : null;
      const { error } = await admin.from('user_restriction').upsert(
        { phone, kind, reason: String(b.reason ?? '').slice(0, 300), issued_by: ctx.phone, expires_at: until },
        { onConflict: 'phone,kind' },
      );
      if (error) return fail('restrict', 'محدودسازی ناموفق بود', 500);
      await admin.from('audit_log').insert({
        actor: ctx.phone,
        action: kind === 'ban' ? 'ban' : 'mute',
        target: phone,
        detail: { until },
      });
      return ok({ restricted: true, phone, kind });
    }

    if (action === 'lift') {
      const phone = normalisePhone(b.phone as string);
      const kind = b.kind === 'mute' ? 'mute' : 'ban';
      const { error } = await admin.from('user_restriction').delete().eq('phone', phone).eq('kind', kind);
      if (error) return fail('lift', 'لغو محدودیت ناموفق بود', 500);
      await admin.from('audit_log').insert({ actor: ctx.phone, action: 'un' + kind, target: phone });
      return ok({ lifted: true });
    }

    if (action === 'purge-user') {
      assertAdminCode(req, ctx);
      const phone = normalisePhone(b.phone as string);
      const { error } = await admin.from('user_restriction').upsert(
        { phone, kind: 'ban', reason: 'purged by admin', issued_by: ctx.phone, expires_at: null },
        { onConflict: 'phone,kind' },
      );
      if (error) return fail('purge', 'اقدام ناموفق بود', 500);
      await admin.from('audit_log').insert({ actor: ctx.phone, action: 'purge_user', target: phone });
      return ok({
        purged: true,
        note: 'rows are retained for moderation history; hard deletion is a separate reviewed migration',
      });
    }

    return fail('unknown_action', 'action ناشناخته است', 400);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[moderation]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});
