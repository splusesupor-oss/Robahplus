import { fail, ok, preflight } from '../_shared/respond.ts';
import { AuthError, context, serviceClient } from '../_shared/context.ts';

/**
 * POST /functions/v1/notifications
 *   { action: 'register', token, platform }   — store the FCM token for this device
 *   { action: 'unregister', token }
 *   { action: 'test', phone }                  — admin/dev: send a single push
 *
 * The Firebase service account JSON lives in the `FCM_SERVICE_ACCOUNT` Supabase secret (exactly
 * as it does on the legacy worker) — it is read here and never sent to a client.
 */
Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(b.action ?? '');
  try {
    const ctx = context(req);
    const admin = serviceClient();

    if (action === 'register') {
      const token = String(b.token ?? '').slice(0, 512);
      if (token.length < 20) return fail('token', 'توکن FCM نامعتبر است');
      const { error } = await admin.from('device_token')
        .upsert({
          phone: ctx.phone,
          token,
          platform: String(b.platform ?? 'android'),
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'token' });
      if (error) return fail('register', 'ذخیره توکن ناموفق بود', 400);
      return ok({ registered: true });
    }
    if (action === 'unregister') {
      const { error } = await admin.from('device_token').delete().eq('token', String(b.token ?? '')).eq(
        'phone',
        ctx.phone,
      );
      if (error) return fail('unregister', 'حذف توکن ناموفق بود', 400);
      return ok({ unregistered: true });
    }
    if (action === 'test') {
      if (!ctx.isAdmin) return fail('forbidden', 'فقط برای مدیر', 403);
      const target = String(b.phone ?? ctx.phone);
      const { data } = await admin.from('device_token').select('token').eq('phone', target).limit(5);
      const sent = await Promise.all(
        (data ?? []).map((d: { token: string }) => sendFcm(d.token, { title: 'روباه پلاس', body: 'تست اعلان' })),
      );
      return ok({ sent: sent.filter(Boolean).length, tried: (data ?? []).length });
    }
    return fail('unknown_action', 'action ناشناخته است', 400);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[notifications]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});

async function sendFcm(token: string, payload: { title: string; body: string }): Promise<boolean> {
  const sa = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (!sa) return false;
  try {
    const acct = JSON.parse(sa) as { project_id: string; private_key: string; client_email: string };
    const jwt = await signGtoken(acct);
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${acct.project_id}/messages:send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ message: { token, notification: payload, android: { priority: 'HIGH' } } }),
    });
    return r.ok;
  } catch (e) {
    console.error('[fcm]', (e as Error).message);
    return false;
  }
}

/** Minimal RS256 JWT for the Google OAuth2 token endpoint, using WebCrypto (no npm deps). */
async function signGtoken(acct: { private_key: string; client_email: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: acct.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const b64 = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const header = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64(JSON.stringify(claims));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(acct.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${b64(String.fromCharCode(...new Uint8Array(sig)))}`;
}

function pemToDer(pem: string): ArrayBuffer {
  const b = atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, ''));
  const a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a.buffer;
}
