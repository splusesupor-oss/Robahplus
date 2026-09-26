import { fail, ok, preflight } from '../_shared/respond.ts';
import { AuthError, context, serviceClient } from '../_shared/context.ts';

/**
 * POST /functions/v1/group
 *   { action: 'create', name, description?, photoPath?, joinFeeDiamonds?, requestId }
 *   { action: 'list' } | { action: 'get', groupId } | { action: 'update', groupId, patch }
 *   { action: 'join', groupId, requestId? } | { action: 'leave', groupId }
 *   { action: 'invite', groupId, phone } | { action: 'kick', groupId, phone }
 *   { action: 'set-role', groupId, phone, role }      // owner/admin only
 *   { action: 'mute', groupId, phone, minutes }        // owner/admin only
 *   { action: 'ban', groupId, phone, reason?, until? } // owner/admin only
 *   { action: 'pin', groupId, messageId|null }
 *
 * Group creation debits the 399-diamond fee through app.wallet_debit (idempotent per requestId)
 * and writes the group + owner membership in one service-role transaction, so a client can
 * neither skip the fee nor claim ownership of an existing group.
 */
const CREATE_FEE = 399;
const GROUP_ID_RE = /^[a-z0-9][a-z0-9_.:-]{1,63}$/;
const ROLE_RE = /^(member|admin)$/;

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(b.action ?? 'list');
  try {
    const ctx = context(req);
    const admin = serviceClient();

    if (action === 'create') {
      const name = String(b.name ?? '').trim();
      if (name.length < 2 || name.length > 80) return fail('name', 'نام گروه ۲ تا ۸۰ نویسه باشد');
      const requestId = String(b.requestId ?? `gc:${ctx.phone}:${Date.now()}`);
      const fee = await ctx.user.rpc('wallet_debit', {
        p_currency: 'diamond',
        p_amount: CREATE_FEE,
        p_kind: 'group_creation',
        p_request_id: requestId,
        p_meta: { name },
      });
      const fr = fee.data as { ok?: boolean; error?: string };
      if (!fr?.ok) return fail(fr?.error ?? 'fee_failed', 'برای ساخت گروه به ۳۹۹ الماس نیاز است', 400);

      const groupId = `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      const { data: group, error } = await admin.from('group').insert({
        id: GROUP_ID_RE.test(groupId) ? groupId : 'g_main0',
        name,
        description: String(b.description ?? '').slice(0, 1000),
        photo_path: b.photoPath ? String(b.photoPath) : null,
        owner_phone: ctx.phone,
        join_fee_diamonds: Math.max(0, Math.min(100000, Number(b.joinFeeDiamonds ?? 0))),
      }).select().single();
      if (error) {
        // roll the fee back so a failed insert never eats a user's diamonds
        await ctx.user.rpc('wallet_credit', {
          p_currency: 'diamond',
          p_amount: CREATE_FEE,
          p_kind: 'refund',
          p_request_id: `refund:${requestId}`,
          p_meta: { reason: 'group_create_failed' },
        });
        return fail('insert', 'ساخت گروه ناموفق بود', 500);
      }
      await admin.from('group_member').insert({ group_id: group.id, phone: ctx.phone, role: 'owner' });
      await admin.from('audit_log').insert({
        actor: ctx.phone,
        action: 'group_create',
        target: group.id,
        detail: { name },
      });
      return ok({ group, transaction: { requestId } }, 201);
    }

    if (action === 'list') {
      const { data, error } = await ctx.user
        .from('group')
        .select(
          'id,name,description,photo_path,owner_phone,bot_enabled,join_fee_diamonds,created_at,settings,group_member(count)',
        )
        .order('created_at', { ascending: false });
      if (error) return fail('list', 'خطا در دریافت گروه‌ها', 500);
      return ok({ groups: data ?? [] });
    }

    if (action === 'get') {
      const id = String(b.groupId ?? '');
      const { data, error } = await ctx.user.from('group').select('*').eq('id', id).maybeSingle();
      if (error) return fail('get', 'خطا', 500);
      if (!data) return fail('not_member', 'گروه یافت نشد (یا عضو آن نیستید)', 403);
      const members = await ctx.user.from('group_member').select(
        'phone,role,muted_until,joined_at,profile(name,username,avatar_url,code)',
      ).eq('group_id', id);
      return ok({ group: data, members: members.data ?? [] });
    }

    if (action === 'join') {
      const id = String(b.groupId ?? '');
      const fee = Number(b.joinFeeDiamonds ?? 0);
      if (fee > 0) {
        const r = await ctx.user.rpc('wallet_debit', {
          p_currency: 'diamond',
          p_amount: fee,
          p_kind: 'group_join_fee',
          p_group_id: id,
          p_request_id: String(b.requestId ?? `gj:${id}:${ctx.phone}`),
        });
        const rr = r.data as { ok?: boolean; error?: string };
        if (!rr?.ok) return fail(rr?.error ?? 'fee_failed', 'الماس کافی برای عضویت ندارید', 400);
      }
      const { error } = await ctx.user.from('group_member').insert({ group_id: id, phone: ctx.phone, role: 'member' });
      if (error) return fail('join', 'عضویت ناموفق بود (شاید در این گروه بن شده‌اید)', 400);
      return ok({ joined: true });
    }

    if (action === 'leave') {
      const id = String(b.groupId ?? '');
      const { error } = await ctx.user.from('group_member').delete().eq('group_id', id).eq('phone', ctx.phone);
      if (error) return fail('leave', 'خروج ناموفق بود', 400);
      await admin.from('audit_log').insert({ actor: ctx.phone, action: 'group_leave', target: id });
      return ok({ left: true });
    }

    if (action === 'kick' || action === 'invite') {
      const id = String(b.groupId ?? '');
      const target = String(b.phone ?? '');
      if (action === 'invite') {
        const { error } = await admin.from('group_member').insert({ group_id: id, phone: target, role: 'member' });
        if (error) return fail('invite', 'دعوت ناموفق بود', 400);
        return ok({ invited: true });
      }
      const { error } = await admin.from('group_member').delete().eq('group_id', id).eq('phone', target);
      if (error) return fail('kick', 'اخراج ناموفق بود', 400);
      return ok({ kicked: true });
    }

    if (action === 'set-role') {
      const role = String(b.role ?? '');
      if (!ROLE_RE.test(role)) return fail('role', 'نقش نامعتبر است (member|admin)');
      const id = String(b.groupId ?? '');
      const me = await ctx.user.from('group_member').select('role').eq('group_id', id).eq('phone', ctx.phone)
        .maybeSingle();
      if (me.data?.role !== 'owner') return fail('forbidden', 'فقط مالک گروه می‌تواند نقش عوض کند', 403);
      if (role === 'member') {
        const { error } = await admin.from('group_member').update({ role: 'member' }).eq('group_id', id).eq(
          'phone',
          String(b.phone ?? ''),
        );
        if (error) return fail('update', 'عزل ناموفق بود', 400);
      } else {
        const { error } = await admin.from('group_member')
          .upsert({ group_id: id, phone: String(b.phone ?? ''), role: 'admin' }, { onConflict: 'group_id,phone' });
        if (error) return fail('update', 'ارتقا ناموفق بود', 400);
      }
      await admin.from('audit_log').insert({
        actor: ctx.phone,
        action: role === 'admin' ? 'make_admin' : 'remove_admin',
        target: String(b.phone ?? ''),
        group_id: id,
      });
      return ok({ role });
    }

    if (action === 'mute') {
      const id = String(b.groupId ?? '');
      const minutes = Math.max(1, Math.min(60 * 24 * 365, Number(b.minutes ?? 60)));
      const until = new Date(Date.now() + minutes * 60_000).toISOString();
      const { error } = await admin.from('group_member').update({ muted_until: until }).eq('group_id', id).eq(
        'phone',
        String(b.phone ?? ''),
      );
      if (error) return fail('mute', 'محدودسازی ناموفق بود', 400);
      await admin.from('audit_log').insert({
        actor: ctx.phone,
        action: 'mute',
        target: String(b.phone ?? ''),
        group_id: id,
        detail: { minutes },
      });
      return ok({ mutedUntil: until });
    }

    if (action === 'ban') {
      const id = String(b.groupId ?? '');
      const target = String(b.phone ?? '');
      const { error } = await admin.from('group_ban').upsert({
        group_id: id,
        phone: target,
        reason: String(b.reason ?? '').slice(0, 300),
        banned_by: ctx.phone,
        expires_at: b.until ? new Date(Number(b.until)).toISOString() : null,
      }, { onConflict: 'group_id,phone' });
      if (error) return fail('ban', 'بن ناموفق بود', 400);
      await admin.from('group_member').delete().eq('group_id', id).eq('phone', target);
      await admin.from('audit_log').insert({ actor: ctx.phone, action: 'ban', target, group_id: id });
      return ok({ banned: true });
    }

    if (action === 'pin') {
      const id = String(b.groupId ?? '');
      const messageId = b.messageId ? String(b.messageId) : null;
      const { error } = await ctx.user.from('group').update({ pinned_message_id: messageId }).eq('id', id);
      if (error) return fail('pin', 'پین ناموفق بود', 400);
      await admin.from('audit_log').insert({
        actor: ctx.phone,
        action: messageId ? 'pin' : 'unpin',
        target: messageId ?? '',
        group_id: id,
      });
      return ok({ pinned: messageId });
    }

    if (action === 'update') {
      const id = String(b.groupId ?? '');
      const patch = (b.patch ?? {}) as Record<string, unknown>;
      const allowed = [
        'name',
        'description',
        'photo_path',
        'bot_enabled',
        'allow_member_invite',
        'allow_member_edit',
        'join_fee_diamonds',
        'settings',
      ];
      const body2: Record<string, unknown> = {};
      for (const k of allowed) if (k in patch) body2[k] = patch[k];
      if (!Object.keys(body2).length) return fail('patch', 'فیلد قابل ویرایشی ارسال نشده');
      const { error } = await ctx.user.from('group').update(body2).eq('id', id);
      if (error) return fail('update', 'ویرایش ناموفق بود', 400);
      await admin.from('audit_log').insert({ actor: ctx.phone, action: 'group_update', target: id, detail: body2 });
      return ok({ updated: true });
    }

    return fail('unknown_action', 'action ناشناخته است', 400);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[group]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});
