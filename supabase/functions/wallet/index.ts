import { fail, ok, preflight } from '../_shared/respond.ts';
import { assertAdminCode, AuthError, context, normalisePhone, serviceClient } from '../_shared/context.ts';

/**
 * POST /functions/v1/wallet  — the ONLY client-reachable path that can move a balance.
 *
 *   { action: 'read' }
 *   { action: 'transactions', limit? }
 *   { action: 'debit' | 'credit', currency: 'diamond'|'fox_coin', amount, kind,
 *     requestId, groupId?, gameCode?, referenceId?, meta? }
 *   { action: 'buy-diamond-pack', packageId, requestId }
 *   { action: 'admin-grant', phone, currency, amount, code }        // code = FOX_ADMIN_CODE
 *
 * Security properties, all verified by supabase/tests/rls_and_wallet.sql:
 *  - the acting phone comes from the JWT, never from the body;
 *  - amounts are positive ints; the wrapper decides credit vs debit;
 *  - `requestId` makes every call idempotent (replays return the original result, a reused id
 *    with a different payload is rejected);
 *  - there is no INSERT/UPDATE policy on app.wallet / app.wallet_transaction, so a client cannot
 *    write a balance even with a hand-crafted request;
 *  - admin grants additionally need the shared FOX_ADMIN_CODE secret.
 */
const CURRENCIES = new Set(['diamond', 'fox_coin']);
const KINDS = new Set([
  'game_reward',
  'diamond_pack',
  'coin_purchase',
  'transfer',
  'spend',
  'refund',
  'group_creation',
  'group_join_fee',
  'character_purchase',
  'tank_purchase',
  'ai_message',
  'ai_conversation_credits',
  'ranking_prize',
  'profile_bonus',
  'admin_grant',
]);
const MAX_AMOUNT = 1_000_000;

// The price list lives in the database (app.diamond_package, migration 0013) so that neither
// the client bundle nor this file has to carry prices, and so a package can be retired without
// a deploy.  We only ever read it back from PostgREST.
type Pack = { id: string; label: string; diamonds: number; coinsRequired: number; priceToman: number };

async function listPackages(client: ReturnType<typeof serviceClient>): Promise<Pack[]> {
  const { data, error } = await client.rpc('wallet_packages');
  if (error) throw new Error(`wallet_packages: ${error.message}`);
  return (data ?? []) as Pack[];
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(body.action ?? 'read');

  try {
    const ctx = context(req, {
      admin: action === 'admin-grant' || action === 'confirm-payment',
      service: action === 'confirm-payment',
    });

    if (action === 'read') {
      const { data, error } = await ctx.user.rpc('wallet_snapshot').single();
      if (error) return fail('read', 'خطا در دریافت کیف پول', 500);
      return ok({ wallet: data, source: 'wallet-v1' });
    }

    if (action === 'transactions') {
      const limit = Math.min(200, Math.max(1, Number(body.limit ?? 50)));
      const { data, error } = await ctx.user
        .from('wallet_transaction')
        .select('id,kind,currency,amount,balance_after,group_id,game_code,reference_id,request_id,created_at,meta')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return fail('transactions', 'خطا در دریافت تراکنش‌ها', 500);
      return ok({ transactions: data ?? [] });
    }

    if (action === 'debit' || action === 'credit') {
      const currency = String(body.currency ?? '');
      const amount = Number(body.amount);
      const kind = String(body.kind ?? 'spend');
      const requestId = String(body.requestId ?? '');
      if (!CURRENCIES.has(currency)) return fail('currency', 'واحد نامعتبر است');
      if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_AMOUNT) {
        return fail('amount', 'مقدار نامعتبر است');
      }
      if (!KINDS.has(kind)) return fail('kind', 'نوع تراکنش نامعتبر است');
      if (requestId.length < 6 || requestId.length > 128) {
        return fail('requestId', 'requestId باید ۶ تا ۱۲۸ نویسه باشد');
      }
      if (kind === 'admin_grant') return fail('kind', 'این نوع تراکنش از کلاینت مجاز نیست', 403);

      const fn = action === 'credit' ? 'wallet_credit' : 'wallet_debit';
      const { data, error } = await ctx.user.rpc(fn, {
        p_currency: currency,
        p_amount: amount,
        p_kind: kind,
        p_group_id: body.groupId ? String(body.groupId) : null,
        p_game_code: body.gameCode ? String(body.gameCode) : null,
        p_reference_id: body.referenceId ? String(body.referenceId) : null,
        p_request_id: requestId,
        p_meta: (body.meta as Record<string, unknown>) ?? {},
      });
      if (error) return fail('rpc', 'خطا در ثبت تراکنش', 500);
      const r = data as {
        ok?: boolean;
        error?: string;
        balance?: number;
        transaction_id?: string;
        idempotent?: boolean;
      };
      if (!r.ok) return fail(r.error ?? 'failed', messageFor(r.error), 400, { balance: r.balance });
      /* the response carries the whole wallet on purpose: the UI paints that object and nothing
       * else, so there is no client-side arithmetic left to get wrong */
      return ok({ transaction: r, balance: r.balance, idempotent: !!r.idempotent, wallet: await snapshot(ctx) });
    }

    if (action === 'buy-diamond-pack') {
      const requestId = String(body.requestId ?? `pack:${body.packageId}:${Date.now()}`);
      if (requestId.length < 6 || requestId.length > 128) {
        return fail('requestId', 'requestId باید ۶ تا ۱۲۸ نویسه باشد');
      }
      const { data, error } = await ctx.user.rpc('buy_diamond_pack', {
        p_package: String(body.packageId ?? ''),
        p_request_id: requestId,
        p_payment_ref: body.paymentRef ? String(body.paymentRef) : null,
      });
      if (error) return fail('rpc', 'خطا در خرید بسته', 500);
      const r = data as Pack & {
        ok?: boolean;
        error?: string;
        status?: string;
        amount?: number;
        wallet?: unknown;
        transaction?: unknown;
      };
      if (!r.ok) return fail(r.error ?? 'failed', messageFor(r.error), 400);
      return ok({
        purchase: { packageId: body.packageId, status: r.status, amount: r.amount },
        wallet: r.wallet ?? await snapshot(ctx),
      });
    }

    /* Payment gateway confirmation.  Only the service role or an admin may complete somebody
     * else's pending purchase, because the caller is not the wallet owner any more. */
    if (action === 'confirm-payment') {
      if (!ctx.isService) assertAdminCode(req, ctx);
      const requestId = String(body.requestId ?? '');
      if (requestId.length < 6) return fail('requestId', 'requestId لازم است');
      const admin = serviceClient();
      const { data, error } = await admin.rpc('buy_diamond_pack', {
        p_package: body.packageId ? String(body.packageId) : null,
        p_request_id: requestId,
        p_payment_ref: String(body.paymentRef ?? 'gateway'),
      });
      if (error) return fail('rpc', 'خطا در تأیید پرداخت', 500);
      const r = data as { ok?: boolean; error?: string; status?: string };
      if (!r.ok) return fail(r.error ?? 'failed', messageFor(r.error), 400);
      await admin.from('audit_log').insert({
        actor: ctx.phone || 'service',
        action: 'confirm_payment',
        target: requestId,
        detail: { paymentRef: body.paymentRef ?? null },
      });
      return ok({ result: r });
    }

    if (action === 'packages') {
      return ok({ packages: await listPackages(ctx.user) });
    }

    if (action === 'admin-grant') {
      assertAdminCode(req, ctx);
      const target = normalisePhone(body.phone as string);
      const admin = serviceClient();
      const { data, error } = await admin.rpc('wallet_apply', {
        p_currency: String(body.currency ?? 'diamond'),
        p_delta: Math.abs(Number(body.amount ?? 0)),
        p_kind: 'admin_grant',
        p_request_id: String(body.requestId ?? `grant:${target}:${Date.now()}`),
        p_meta: { admin: ctx.phone, via: 'admin-grant' },
        p_phone: target,
      });
      if (error) return fail('grant', 'خطا در شارژ', 500);
      const r = data as { ok?: boolean; error?: string; balance?: number };
      if (!r.ok) return fail(r.error ?? 'failed', 'شارژ ناموفق بود', 400);
      await admin.from('audit_log').insert({
        actor: ctx.phone,
        action: 'admin_grant',
        target,
        detail: { currency: body.currency, amount: body.amount, requestId: body.requestId ?? null },
      });
      return ok({ result: r });
    }

    return fail('unknown_action', 'action ناشناخته است', 400, {
      actions: ['read', 'transactions', 'debit', 'credit', 'buy-diamond-pack', 'confirm-payment', 'packages'],
    });
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[wallet]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});

async function snapshot(ctx: { user: ReturnType<typeof serviceClient> }) {
  const { data } = await ctx.user.rpc('wallet_snapshot');
  return data ?? null;
}

function messageFor(code?: string): string {
  switch (code) {
    case 'insufficient_diamonds':
      return 'الماس کافی ندارید';
    case 'insufficient_coins':
      return 'سکه روباه کافی ندارید';
    case 'idempotency_conflict':
      return 'این درخواست قبلاً با مشخصات دیگری ثبت شده است';
    case 'auth_required':
      return 'ابتدا وارد شوید';
    case 'forbidden':
      return 'دسترسی مجاز نیست';
    default:
      return 'تراکنش ناموفق بود';
  }
}
