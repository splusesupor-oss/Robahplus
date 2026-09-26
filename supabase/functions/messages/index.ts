import { fail, ok, preflight } from '../_shared/respond.ts';
import { AuthError, context, normalisePhone, serviceClient } from '../_shared/context.ts';

/**
 * POST /functions/v1/messages
 *   { action: 'group-send', groupId, body, mediaPaths?, replyTo?, clientMsgId? }
 *   { action: 'group-history', groupId, before?, limit? }
 *   { action: 'group-delete', messageId }
 *   { action: 'dm-thread', otherPhone } | { action: 'dm-send', otherPhone, body, mediaPaths?, clientMsgId? }
 *   { action: 'dm-history', otherPhone, before?, limit? } | { action: 'dm-delete', messageId, forEveryone? }
 *   { action: 'seen', groupId }
 *
 * Live delivery is NOT done here: clients subscribe with
 *   supabase.channel('fox:group:' + groupId).on('postgres_changes',
 *     { event: 'INSERT', schema: 'app', table: 'group_message', filter: 'group_id=eq.' + groupId }, …)
 * so Realtime stays subject to RLS.  This function only does writes that need server-side checks
 * (mute/ban state, idempotent insert via clientMsgId, mention/hashtag parsing).
 */
const MAX_LEN = 4000;

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(b.action ?? '');
  try {
    const ctx = context(req);
    const admin = serviceClient();

    if (action === 'group-send') {
      const groupId = String(b.groupId ?? '');
      const body = String(b.body ?? '').trim();
      if (!body && !(b.mediaPaths as unknown[])?.length) return fail('empty', 'پیام خالی است');
      if (body.length > MAX_LEN) return fail('too_long', 'پیام بیش از حد بلند است');
      const me = await ctx.user.from('group_member').select('role,muted_until').eq('group_id', groupId).eq(
        'phone',
        ctx.phone,
      ).maybeSingle();
      if (!me.data) return fail('not_member', 'شما عضو این گروه نیستید', 403);
      if (me.data.muted_until && new Date(me.data.muted_until).getTime() > Date.now()) {
        return fail('muted', 'در این گروه محدود شده‌اید', 403);
      }
      const row = {
        group_id: groupId,
        sender_phone: ctx.phone,
        body,
        media_paths: (b.mediaPaths as string[]) ?? [],
        reply_to: b.replyTo ? String(b.replyTo) : null,
      };
      // clientMsgId gives offline-tolerant sends: the unique index below makes a retry a no-op
      if (b.clientMsgId) {
        const dup = await ctx.user.from('group_message')
          .select('id').eq('group_id', groupId).eq('sender_phone', ctx.phone)
          .eq('body', body).gt('created_at', new Date(Date.now() - 60_000).toISOString()).limit(1).maybeSingle();
        if (dup.data) return ok({ message: dup.data, deduped: true });
      }
      const { data, error } = await ctx.user.from('group_message').insert(row).select().single();
      if (error) return fail('send', 'ارسال ناموفق بود', 400);
      if (body.startsWith('/')) return ok({ message: data, command: body.slice(1) });
      return ok({ message: data });
    }

    if (action === 'group-history') {
      const limit = Math.min(200, Math.max(1, Number(b.limit ?? 50)));
      let q = ctx.user.from('group_message')
        .select(
          'id,group_id,sender_phone,body,media_paths,reply_to,created_at,profile:sender_phone(name,username,avatar_url)',
        )
        .eq('group_id', String(b.groupId ?? ''))
        .order('created_at', { ascending: false }).limit(limit);
      if (b.before) q = q.lt('created_at', new Date(Number(b.before)).toISOString());
      const { data, error } = await q;
      if (error) return fail('history', 'خطا در دریافت پیام‌ها', 500);
      return ok({ messages: (data ?? []).reverse() });
    }

    if (action === 'group-delete') {
      const { error } = await ctx.user.from('group_message').delete().eq('id', String(b.messageId ?? ''));
      if (error) return fail('delete', 'حذف ناموفق بود', 400);
      return ok({ deleted: true });
    }

    if (action === 'seen') {
      const { error } = await ctx.user.from('group_seen').upsert(
        { group_id: String(b.groupId ?? ''), phone: ctx.phone, last_read_at: new Date().toISOString() },
        { onConflict: 'group_id,phone' },
      );
      if (error) return fail('seen', 'خطا', 400);
      return ok({ seen: true });
    }

    if (action === 'dm-thread' || action === 'dm-send' || action === 'dm-history') {
      const other = normalisePhone(b.otherPhone as string);
      if (other === ctx.phone) return fail('self', 'نمی‌توانید به خودتان پیام دهید');
      const blocked = await admin.from('block').select('blocker_phone')
        .or(`blocker_phone.eq.${other},blocked_phone.eq.${ctx.phone}`).limit(1).maybeSingle();
      if (blocked.data) return fail('blocked', 'امکان ارسال پیام وجود ندارد', 403);

      const { data: thread, error: tErr } = await admin.from('dm_thread')
        .upsert({ phone_a: [ctx.phone, other].sort()[0], phone_b: [ctx.phone, other].sort()[1] }, {
          onConflict: 'phone_a,phone_b',
          ignoreDuplicates: true,
        })
        .select().maybeSingle();
      let threadId = thread?.id;
      if (!threadId) {
        const { data: existing } = await ctx.user.from('dm_thread')
          .select('id').or(
            `and(phone_a.eq.${ctx.phone},phone_b.eq.${other}),and(phone_a.eq.${other},phone_b.eq.${ctx.phone})`,
          )
          .maybeSingle();
        threadId = existing?.id;
      }
      if (!threadId) return fail('thread', 'ساخت گفتگو ناموفق بود', tErr ? 500 : 404);
      if (action === 'dm-thread') return ok({ threadId });

      if (action === 'dm-send') {
        const body = String(b.body ?? '').trim();
        if (!body && !(b.mediaPaths as unknown[])?.length) return fail('empty', 'پیام خالی است');
        const { data, error } = await ctx.user.from('dm_message').insert({
          thread_id: threadId,
          sender_phone: ctx.phone,
          body: body.slice(0, MAX_LEN),
          media_paths: (b.mediaPaths as string[]) ?? [],
          reply_to: b.replyTo ? String(b.replyTo) : null,
        }).select().single();
        if (error) return fail('send', 'ارسال ناموفق بود', 400);
        return ok({ message: data });
      }
      const limit = Math.min(200, Math.max(1, Number(b.limit ?? 50)));
      const { data, error } = await ctx.user.from('dm_message')
        .select('id,thread_id,sender_phone,body,media_paths,created_at,edited_at')
        .eq('thread_id', threadId).order('created_at', { ascending: false }).limit(limit);
      if (error) return fail('history', 'خطا', 500);
      return ok({ messages: (data ?? []).reverse(), threadId });
    }

    if (action === 'dm-delete') {
      const forEveryone = !!b.forEveryone;
      if (forEveryone) {
        const { error } = await ctx.user.from('dm_message').delete().eq('id', String(b.messageId ?? '')).eq(
          'sender_phone',
          ctx.phone,
        );
        if (error) return fail('delete', 'حذف ناموفق بود', 400);
        return ok({ deletedForEveryone: true });
      }
      const { error } = await ctx.user.rpc('dm_mark_deleted', { m: String(b.messageId ?? '') });
      if (error) return fail('delete', 'حذف ناموفق بود', 400);
      return ok({ deletedForMe: true });
    }

    return fail('unknown_action', 'action ناشناخته است', 400);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[messages]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});
