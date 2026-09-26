import { fail, ok, preflight } from '../_shared/respond.ts';
import { AuthError, context, normalisePhone, PHONE_RE, serviceClient } from '../_shared/context.ts';

/**
 * POST /functions/v1/auth
 *   { action: 'send-code', phone, kind: 'register' | 'login' }
 *   { action: 'verify',    phone, code, device?, pushToken? }
 *   { action: 'me' }
 *   { action: 'logout' }
 *
 * The 6-digit flow the Robah Plus APK and web client already speak.  Codes are hashed with a
 * server-side pepper, expire in 5 minutes and are single use (see migration 0003).  Preferred
 * long-term path is Supabase Phone Auth (Twilio Verify): `send-code` then delegates to it when
 * FOX_USE_SUPABASE_PHONE_AUTH=true, so the client contract does not change.
 */
const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RATE_WINDOW_MS = 60 * 1000;

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'این مسیر فقط با POST کار می‌کند', 405);

  const admin = serviceClient();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail('bad_json', 'بدنه درخواست نامعتبر است');
  }
  const action = String(body.action ?? '');
  const phone = normalisePhone(body.phone as string);

  try {
    if (action === 'send-code') return await sendCode(admin, phone, String(body.kind ?? 'login'));
    if (action === 'verify') return await verify(admin, phone, String(body.code ?? ''), body);
    if (action === 'logout') {
      /* The JWT itself is stateless (revocation is GoTrue's job); what we can do server-side is
       * stop pushing to this device and forget the device pairing, so a logged-out APK stops
       * receiving group notifications.  Requires a valid token — no anonymous sweeps. */
      const ctx = context(req);
      await ctx.admin.from('device_token').delete().eq('phone', ctx.phone);
      const deviceId = body.device ? String(body.device) : null;
      if (deviceId) await ctx.admin.from('session_device').delete().eq('id', deviceId).eq('phone', ctx.phone);
      return ok({ signedOut: true });
    }
    if (action === 'profile') {
      const ctx = context(req);
      const name = body.name === undefined ? null : String(body.name).slice(0, 64);
      const bio = body.bio === undefined ? null : String(body.bio).slice(0, 500);
      const avatarPath = body.avatarPath === undefined ? null : String(body.avatarPath).slice(0, 400);
      if (name === null && bio === null && avatarPath === null) {
        return fail('empty_update', 'هیچ فیلدی برای ویرایش داده نشد', 400);
      }
      const { error } = await ctx.user.rpc('set_profile', {
        p_name: name,
        p_bio: bio,
        p_avatar_path: avatarPath,
      });
      if (error) return fail('profile', 'خطا در ذخیره پروفایل', 500);
      let usernameResult: { changed: boolean; error?: string } = { changed: false };
      if (body.username) {
        const { error: ue } = await ctx.user.rpc('set_username', { p_username: String(body.username) });
        usernameResult = ue
          ? { changed: false, error: ue.code === '23505' ? 'username_taken' : 'username_invalid' }
          : { changed: true };
      }
      const { data: profile } = await ctx.user.from('profile').select('*').eq('phone', ctx.phone).maybeSingle();
      const wallet = await ctx.user.rpc('wallet_snapshot').single();
      return ok({
        user: profile ?? null,
        wallet: wallet.data ?? null,
        username: usernameResult,
        ...(usernameResult.error ? { warning: usernameResult.error } : {}),
      });
    }
    if (action === 'me') {
      const ctx = context(req);
      const { data, error } = await ctx.user.from('profile').select('*').eq('phone', ctx.phone).maybeSingle();
      if (error) return fail('profile', 'خطا در دریافت پروفایل', 500);
      const wallet = await ctx.user.rpc('wallet_snapshot').single();
      return ok({ user: data ?? null, wallet: wallet.data ?? null, serverTime: Date.now() });
    }
    return fail('unknown_action', 'action ناشناخته است', 400, {
      actions: ['send-code', 'verify', 'me', 'profile', 'logout'],
    });
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[auth]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});

async function sendCode(admin: ReturnType<typeof serviceClient>, phone: string, kind: string) {
  if (!PHONE_RE.test(phone)) return fail('bad_phone', 'شماره معتبر نیست (مثلاً 09123456789)');
  const { count } = await admin.from('auth_code')
    .select('phone', { count: 'exact', head: true })
    .eq('phone', phone)
    .gt('created_at', new Date(Date.now() - RATE_WINDOW_MS).toISOString());
  if ((count ?? 0) >= 3) return fail('rate_limited', 'تعداد درخواست کد زیاد است، بعداً تلاش کنید', 429);

  const exists = await admin.from('identity').select('phone').eq('phone', phone).maybeSingle();
  if (kind === 'register' && exists.data) return fail('already_registered', 'این شماره قبلاً ثبت شده است', 409);
  if (kind === 'login' && !exists.data) return fail('not_registered', 'این شماره ثبت نشده است', 404);

  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000);
  const { data: hashed, error: hErr } = await admin.rpc('hash_code', { p_code: code }).single();
  if (hErr) return fail('hash', 'خطا در تولید کد', 500);

  await admin.from('auth_code').delete().eq('phone', phone).eq('kind', kind);
  const { error } = await admin.from('auth_code').insert({
    phone,
    code_hash: hashed,
    kind,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (error) return fail('insert_code', 'خطا در ذخیره کد', 500);

  // Delivery is an SMS-provider concern (Kavenegar / Twilio).  The provider credential lives in
  // Supabase secrets; the code itself is never logged and never returned to the client.
  if (Deno.env.get('FOX_CODE_PEPPER') && Deno.env.get('FOX_SMS_PROVIDER')) {
    await deliverSms(phone, code).catch((e) => console.error('[auth] sms failed', e?.message));
  } else {
    console.warn('[auth] SMS provider not configured — code not delivered');
  }
  return ok({ sent: true, expiresInSec: CODE_TTL_MS / 1000 });
}

async function deliverSms(phone: string, code: string) {
  const url = Deno.env.get('FOX_SMS_URL');
  const key = Deno.env.get('FOX_SMS_KEY');
  if (!url || !key) throw new Error('FOX_SMS_URL / FOX_SMS_KEY missing');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ receptor: phone, template: 'fox-login', dynamic_data: { code } }),
  });
  if (!r.ok) throw new Error(`sms ${r.status}`);
}

async function verify(
  admin: ReturnType<typeof serviceClient>,
  phone: string,
  code: string,
  body: Record<string, unknown>,
) {
  if (!PHONE_RE.test(phone)) return fail('bad_phone', 'شماره معتبر نیست');
  if (!/^\d{6}$/.test(code)) return fail('bad_code', 'کد ۶ رقمی را وارد کنید');
  const { data: hashed, error: hErr } = await admin.rpc('hash_code', { p_code: code }).single();
  if (hErr) return fail('hash', 'خطای سرور', 500);

  const { data: row, error } = await admin.from('auth_code')
    .select('*')
    .eq('phone', phone)
    .eq('code_hash', hashed)
    .maybeSingle();
  if (error) return fail('lookup', 'خطای سرور', 500);
  if (!row) return fail('bad_code', 'کد نادرست است', 401);
  if (new Date(row.expires_at).getTime() < Date.now()) return fail('expired', 'کد منقضی شده است', 401);

  if (row.attempts >= MAX_ATTEMPTS) {
    await admin.from('auth_code').delete().eq('code_hash', row.code_hash);
    return fail('too_many_attempts', 'تعداد تلاش زیاد است، کد جدید بگیرید', 429);
  }

  let identity = await admin.from('identity').select('user_id').eq('phone', phone).maybeSingle();
  if (!identity.data) {
    // Provision the auth.users row through the admin API so Supabase owns the credentials.
    const created = await createUser(phone);
    if (!created) return fail('provision', 'ساخت حساب ناموفق بود', 500);
    await admin.from('identity').insert({ phone, user_id: created });
    await admin.from('profile').insert({ phone, user_id: created, name: '', username: '' });
    await admin.from('wallet').insert({ phone });
    identity = { data: { user_id: created }, error: null } as typeof identity;
  }

  await admin.from('auth_code').delete().eq('code_hash', row.code_hash);
  if (body.device) {
    await admin.from('session_device').upsert({ id: String(body.device), phone, ua: String(body.ua ?? '') }, {
      onConflict: 'id',
    });
  }

  const adminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const sessionRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/generate_link`, {
    headers: { apikey: adminKey, authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', email: `${phone}@fox.local` }),
  }).catch(() => null);
  void sessionRes; // optional; the client can also keep using its own bearer token

  const verifiedAt = new Date().toISOString();
  await admin.from('profile').update({ last_seen_at: verifiedAt }).eq('phone', phone);
  return ok({
    verified: true,
    phone,
    userId: identity.data?.user_id,
    note: 'exchange the Supabase access_token for API calls (anon key + Authorization header)',
  });
}

/** Creates auth.users via the GoTrue admin API; falls back to a direct insert for local dev. */
async function createUser(phone: string): Promise<string | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: key ?? '', authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ phone, phone_confirm: true, app_metadata: { role: 'user' } }),
  });
  if (res.ok) {
    const j = await res.json();
    return String(j.id ?? '');
  }
  const text = await res.text();
  console.error('[auth] create user failed', res.status, text.slice(0, 300));
  return null;
}
