import { createClient, decodeJwt, type SupabaseClient } from './deps.ts';

export interface FoxContext {
  /** Client bound to the caller's JWT: every query is filtered by RLS. */
  user: SupabaseClient;
  /** Service-role client. Never reaches the browser; only for cross-user/admin writes. */
  admin: SupabaseClient;
  phone: string;
  userId: string;
  isAdmin: boolean;
  /** true when the caller presented the service-role key (payment webhooks, scheduled jobs). */
  isService: boolean;
  claims: Record<string, unknown>;
}

export class AuthError extends Error {
  constructor(public code = 'unauthorized', message = 'ابتدا وارد حساب شوید', public status = 401) {
    super(message);
  }
}

/** Iranian mobile, the same regex the legacy worker used (`/^09\d{9}$/`). */
export const PHONE_RE = /^09\d{9}$/;

export function normalisePhone(raw: string | null | undefined): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('0098')) return '0' + digits.slice(4);
  if (digits.startsWith('98') && digits.length === 12) return '0' + digits.slice(2);
  if (digits.length === 10 && digits.startsWith('9')) return '0' + digits;
  return digits;
}

function url(): string {
  const u = Deno.env.get('SUPABASE_URL');
  if (!u) throw new Error('SUPABASE_URL is not set');
  return u;
}

export function serviceClient(): SupabaseClient {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(url(), key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Builds the request context.  The phone is taken from the verified JWT only — never from the
 * body — so no request can act on, or read, another account's wallet or chats.
 */
export function context(
  req: Request,
  opts: { admin?: boolean; service?: boolean } = {},
): FoxContext {
  const auth = req.headers.get('authorization') ?? '';
  const jwt = auth.replace(/^Bearer\s+/i, '');
  if (!jwt) throw new AuthError();
  let claims: Record<string, unknown> = {};
  try {
    claims = decodeJwt(jwt) as Record<string, unknown>;
  } catch {
    throw new AuthError('invalid_token', 'توکن نامعتبر است');
  }
  const exp = Number(claims.exp ?? 0);
  if (exp && exp * 1000 < Date.now()) throw new AuthError('token_expired', 'نشست شما منقضی شده است');

  const role = String(claims.role ?? '');
  const isService = role === 'service_role' || role === 'supabase_admin';
  const phone = normalisePhone(
    typeof claims.phone === 'string'
      ? claims.phone
      : (claims.user_metadata as Record<string, unknown> | undefined)?.phone as string,
  );
  /* A phone is mandatory for every user-facing action.  Only machine callers (the payment
   * gateway webhook, cron jobs — never the browser or the APK) may come without one, and then
   * only when the caller actually holds the service-role key. */
  if (!PHONE_RE.test(phone) && !(opts.service && isService)) {
    throw new AuthError('no_phone', 'شماره موبایل در توکن یافت نشد');
  }

  const ctx: FoxContext = {
    user: createClient(url(), Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    admin: serviceClient(),
    phone,
    userId: String(claims.sub ?? ''),
    isAdmin: (claims.app_metadata as Record<string, unknown> | undefined)?.role === 'admin',
    isService,
    claims,
  };
  if (opts.admin && !ctx.isAdmin && !isService) {
    throw new AuthError('forbidden', 'دسترسی مدیریتی لازم نیست', 403);
  }
  return ctx;
}

/** Admin mutations must also present the shared code that lives in Supabase secrets. */
export function assertAdminCode(req: Request, ctx: FoxContext): void {
  const expected = Deno.env.get('FOX_ADMIN_CODE');
  if (!expected) throw new Error('FOX_ADMIN_CODE secret is not configured');
  const given = req.headers.get('x-fox-admin-code') ?? '';
  if (given !== expected) throw new AuthError('forbidden', 'کد مدیریتی نادرست است', 403);
  ctx.isAdmin = true;
}
