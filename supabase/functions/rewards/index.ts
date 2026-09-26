import { fail, ok, preflight } from '../_shared/respond.ts';
import { AuthError, context } from '../_shared/context.ts';

/**
 * POST /functions/v1/rewards
 *   { action: 'start', gameCode, mode, groupId? }          → { sessionId }
 *   { action: 'finish', sessionId, result: 'won'|'lost'|'draw' }
 *   { action: 'claim', sessionId, requestId }              → pays app.game_reward_rule, idempotent
 *   { action: 'ranking', periodType? } | { action: 'claim-prize', periodType?, periodKey? }
 *
 * The client never sends an amount.  `start` opens a server-side session (which is what makes
 * replay/cheating detectable), `finish` records the outcome, and `claim` pays whatever the rule
 * table says — once per session, capped per day (see migration 0009 + tests §5).
 */
const GAMES = new Set([
  'quiz',
  'sudoku',
  'bow',
  'memh',
  'dooz',
  'dots',
  'mensh',
  'lumb',
  'words',
  'tank',
  'fe',
  'aifox',
  'game2048',
]);
const RESULTS = new Set(['won', 'lost', 'draw']);

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(b.action ?? '');
  try {
    const ctx = context(req);

    if (action === 'start') {
      const gameCode = String(b.gameCode ?? '');
      if (!GAMES.has(gameCode)) return fail('game', 'بازی ناشناخته است');
      const mode = b.mode === 'pvp' ? 'pvp' : 'solo';
      const { data, error } = await ctx.user.from('game_session')
        .insert({ game_code: gameCode, phone: ctx.phone, mode, group_id: b.groupId ? String(b.groupId) : null })
        .select('id,game_code,mode,status').single();
      if (error) return fail('start', 'شروع بازی ناموفق بود', 400);
      return ok({ sessionId: data.id, gameCode, mode });
    }

    if (action === 'finish') {
      const result = String(b.result ?? '');
      if (!RESULTS.has(result)) return fail('result', 'نتیجه نامعتبر است');
      const { data, error } = await ctx.user.from('game_session')
        .update({ status: result, finished_at: new Date().toISOString() })
        .eq('id', String(b.sessionId ?? '')).eq('phone', ctx.phone).eq('status', 'active')
        .select('id,status');
      if (error) return fail('finish', 'ثبت نتیجه ناموفق بود', 400);
      if (!data?.length) return fail('session', 'نشست فعالی برای به‌روزرسانی پیدا نشد', 404);
      return ok({ status: data[0].status });
    }

    if (action === 'claim') {
      const requestId = String(b.requestId ?? '');
      if (requestId.length < 6) return fail('requestId', 'requestId لازم است');
      const { data, error } = await ctx.user.rpc('game_claim_reward', {
        p_session: String(b.sessionId ?? ''),
        p_request_id: requestId,
      }).single();
      if (error) return fail('claim', 'ثبت جایزه ناموفق بود', 500);
      const r = data as Record<string, unknown>;
      if (!r.ok) return fail(String(r.error ?? 'failed'), 'جایزه ثبت نشد', 400);
      const wallet = await ctx.user.rpc('wallet_snapshot').single();
      return ok({ reward: r, wallet: wallet.data });
    }

    if (action === 'ranking') {
      const periodType = b.periodType === 'monthly' ? 'monthly' : 'weekly';
      const { data, error } = await ctx.user.from('leaderboard_weekly').select('*').limit(100);
      if (error) return fail('ranking', 'خطا در دریافت رتبه‌بندی', 500);
      const me = (data ?? []).find((r) => r.phone === ctx.phone) ?? null;
      return ok({ leaderboard: data ?? [], me, periodType });
    }

    if (action === 'claim-prize') {
      const { data, error } = await ctx.user.rpc('claim_ranking_prize', {
        p_period_type: b.periodType === 'monthly' ? 'monthly' : 'weekly',
        p_period_key: b.periodKey ? String(b.periodKey) : null,
      }).single();
      if (error) return fail('prize', 'خطا در دریافت جایزه', 500);
      const r = data as { ok?: boolean; error?: string; prize?: number };
      if (!r.ok) return fail(r.error ?? 'none', 'جایزه‌ای قابل دریافت نیست', 400);
      return ok({ prize: r.prize ?? 0 });
    }

    return fail('unknown_action', 'action ناشناخته است', 400);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[rewards]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});
