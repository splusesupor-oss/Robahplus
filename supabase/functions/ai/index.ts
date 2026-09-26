import { fail, ok, preflight } from '../_shared/respond.ts';
import { AuthError, context, serviceClient } from '../_shared/context.ts';

/**
 * POST /functions/v1/ai — proxy for the AI characters, replacing the legacy worker's inline
 * `/api/ai/chat`.  Two things make this a *function* and not a PostgREST call:
 *
 *  1. the upstream provider key lives in a Supabase secret (AI_GATEWAY_KEY) and never ships in
 *     the APK or the bundle (the legacy code had a fallback literal inside the worker — that is
 *     exactly what this removes);
 *  2. billing is server-side: a paid message debits 1 fox_coin via app.wallet_debit with
 *     request_id = the client's message id, so a retry cannot double-charge and a patched client
 *     cannot set the price or skip it.
 */
const FREE_DAILY = Number(Deno.env.get('FOX_AI_FREE_MESSAGES') ?? 5);
const PRICE_COINS = 1;

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  try {
    const ctx = context(req);
    const admin = serviceClient();
    const characterId = String(b.characterId ?? '');
    const message = String(b.message ?? '').slice(0, 4000);
    if (!characterId || !message.trim()) return fail('args', 'characterId و message لازم است');
    const messageId = String(b.messageId ?? crypto.randomUUID());

    const wallet = await ctx.user.rpc('wallet_snapshot').single();
    const coins = Number((wallet.data as Record<string, unknown>)?.foxCoins ?? 0);
    const dayUsed = await admin.from('dm_message').select('id', { count: 'exact', head: true })
      .eq('sender_phone', ctx.phone).gt('created_at', new Date(Date.now() - 864e5).toISOString()).single();
    const freeQuota = dayUsed.count !== null && dayUsed.count < FREE_DAILY;
    const mode = freeQuota ? 'free' : 'paid';

    if (mode === 'paid' && coins < PRICE_COINS) return fail('insufficient_coins', 'سکه روباه کافی ندارید', 402);

    let debit: Record<string, unknown> | null = null;
    if (mode === 'paid') {
      const { data } = await ctx.user.rpc('wallet_debit', {
        p_currency: 'fox_coin',
        p_amount: PRICE_COINS,
        p_kind: 'ai_message',
        p_reference_id: messageId,
        p_request_id: `ai:${messageId}`,
      }).single();
      debit = data as Record<string, unknown>;
      if (debit && debit.ok !== true) return fail(String(debit.error ?? 'charge_failed'), 'کسر سکه ناموفق بود', 402);
    }

    const key = Deno.env.get('AI_GATEWAY_KEY');
    const base = Deno.env.get('AI_GATEWAY_URL') ?? 'https://api.openai.com/v1';
    if (!key) return fail('config', 'کلید هوش مصنوعی پیکربندی نشده است', 503);

    const persona = await admin.from('ai_character').select('system_prompt,model').eq('code', characterId)
      .maybeSingle();
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: persona.data?.model ?? Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini',
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content: String(persona.data?.system_prompt ?? 'تو روباه، یک دستیار فارسی‌زبان و صمیمی هستی.'),
          },
          { role: 'user', content: message },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      if (debit?.transaction_id) {
        await ctx.user.rpc('wallet_credit', {
          p_currency: 'fox_coin',
          p_amount: PRICE_COINS,
          p_kind: 'refund',
          p_reference_id: `refund:${messageId}`,
          p_request_id: `refund:ai:${messageId}`,
        });
      }
      return fail('upstream', 'پاسخ هوش مصنوعی ناموفق بود', 502, { detail: text.slice(0, 200) });
    }
    const j = await res.json() as { choices?: { message?: { content?: string } }[] };
    const reply = j.choices?.[0]?.message?.content ?? '';
    return ok({ reply, mode, charged: mode === 'paid' ? PRICE_COINS : 0, messageId });
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[ai]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});
