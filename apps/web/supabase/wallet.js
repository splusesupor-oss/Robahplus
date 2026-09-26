/* ============================================================================
 * Robah Plus — wallet state (server is the only source of truth)
 * ----------------------------------------------------------------------------
 * Rules this file enforces:
 *   1. `window.FOX_WALLET` is populated ONLY from /wallet responses.
 *   2. A cached copy may be painted while the first fetch is in flight, but it is
 *      marked stale (`FOX_WALLET.stale === true`) so the UI can dim it and never
 *      treat it as spendable balance.
 *   3. Every mutation (join a group, buy a pack, finish a game, claim a reward)
 *      must go through foxWallet.call(), which refreshes the snapshot from the
 *      response's `wallet` field — the client never recomputes a number itself.
 *
 * Any frontend value that disagrees with the ledger is by definition wrong: the
 * edge functions re-check the balance, the ledger is append-only, and replaying a
 * request id can never double-spend or double-pay.
 * ========================================================================== */
(function () {
  'use strict';

  var CACHE_KEY = 'fox_wallet_cache';
  var state = { diamonds: 0, fox_coins: 0, total_diamonds_earned: 0, total_coins_earned: 0, stale: true };
  var listeners = [];
  var inflight = null;

  function emit() {
    globalThis.FOX_WALLET = Object.assign({}, state);
    listeners.forEach(function (fn) { try { fn(globalThis.FOX_WALLET); } catch (e) {} });
  }
  function paint(next, stale) {
    state = Object.assign({}, state, next || {});
    state.stale = !!stale;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (e) {}
    emit();
  }
  try {
    var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached) { state = Object.assign(state, cached, { stale: true }); }
  } catch (e) {}
  emit();

  function get() { return globalThis.FOX_WALLET; }
  function canAfford(kind, amount) {
    if (kind === 'diamond') return get().diamonds >= amount;
    if (kind === 'fox_coin') return get().fox_coins >= amount;
    return true;
  }

  function refresh() {
    if (inflight) return inflight;
    if (!(globalThis.foxSession && globalThis.foxSession.get())) return Promise.resolve(get());
    inflight = globalThis
      .foxFunction('wallet', { action: 'read' })
      .then(function (res) {
        paint(res.wallet || res, false);
        return get();
      })
      .catch(function () { return get(); })
      .then(function (v) { inflight = null; return v; });
    return inflight;
  }

  /* call an edge function that returns an updated wallet, then re-sync */
  function call(name, body, opts) {
    return globalThis.foxFunction(name, body, opts).then(function (res) {
      if (res && res.wallet) paint(res.wallet, false);
      else refresh();
      return res;
    });
  }

  globalThis.foxWallet = {
    get: get,
    canAfford: canAfford,
    refresh: refresh,
    call: call,
    subscribe: function (fn) { listeners.push(fn); fn(get()); return function () { listeners = listeners.filter(function (x) { return x !== fn; }); }; },
    /* used by the login flow: after a token is stored, drop the cache and read */
    reset: function () { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} paint({}, true); return refresh(); }
  };

  /* re-read when the user comes back — cheap, and it makes a payment on another
   * device visible without a manual refresh */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  globalThis.addEventListener('focus', function () { refresh(); });
  document.addEventListener('fox:session', function (e) { if (!e.detail) { try { localStorage.removeItem(CACHE_KEY); } catch (_) {} paint({ diamonds: 0, fox_coins: 0, total_diamonds_earned: 0, total_coins_earned: 0 }, true); } else refresh(); });
})();
