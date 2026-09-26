/* ============================================================================
 * Robah Plus — Supabase bootstrap (config only, no secrets)
 * ----------------------------------------------------------------------------
 * Loaded FIRST (before every other app/*.js file). It provides the three globals
 * the legacy frontend expects:
 *
 *   FOX_API_BASE   string  base URL used by the existing `api('…')` helper, which
 *                          builds `${FOX_API_BASE}${path}` and therefore keeps
 *                          calling /api/… exactly like before.
 *   FOX_SUPABASE   object  a thin client for auth + PostgREST + realtime
 *                          ({ url, key, session, headers(), channel(), from() }).
 *   FOX_SERVER_WALLET bool  when true the UI must NEVER trust a locally stored
 *                          balance; it only shows what the server returned.
 *
 * Everything is read from window.__FOX_ENV__ (injected per build/host) with
 * sensible same-origin defaults, so no key ever has to be hard-coded here.
 * The publishable anon key is the ONLY credential allowed in a browser/APK;
 * a service-role key must never appear in this file, in the bundle, or in git.
 * ========================================================================== */
(function () {
  'use strict';

  var env = (globalThis.__FOX_ENV__ = globalThis.__FOX_ENV__ || {});

  /* Same origin by default: Cloudflare keeps serving the app and the edge
   * functions live under /functions/v1/*. Set FOX_PROJECT_URL when the APK
   * (or a preview host) has to talk to Supabase directly. */
  var projectUrl = String(env.FOX_PROJECT_URL || '').replace(/\/+$/, '');
  var supabaseUrl = projectUrl || String(env.FOX_API_ORIGIN || '').replace(/\/+$/, '');
  var functionsBase = projectUrl
    ? projectUrl + '/functions/v1'
    : String(env.FOX_FUNCTIONS_BASE || '/functions/v1').replace(/\/+$/, '');

  var cfg = {
    url: supabaseUrl,
    key: String(env.FOX_ANON_KEY || ''),
    functionsBase: functionsBase,
    /* legacy helpers still hit /api/… on the same origin */
    apiBase: String(env.FOX_API_BASE || ''),
    realtimeUrl: (supabaseUrl || location.origin).replace(/^http/, 'ws') + '/realtime/v1/websocket',
    publishable: true
  };

  globalThis.FOX_API_BASE = cfg.apiBase;
  globalThis.FOX_SERVER_WALLET = env.FOX_SERVER_WALLET !== false; /* never opt out in production */

  /* ----------------------------------------------------------------------------
   * Session: the Supabase JWT (what RLS and the edge functions read).
   * `fox_session` is kept as the storage key so an already-installed APK/web
   * client resumes with its existing token.
   * -------------------------------------------------------------------------- */
  var SS_KEY = 'fox_session';
  function readSession() {
    try {
      var raw = localStorage.getItem(SS_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.token) return null;
      if (s.expires_at && s.expires_at * 1000 <= Date.now()) return null; /* refresh below */
      return s;
    } catch (e) {
      return null;
    }
  }
  function writeSession(s) {
    try {
      if (s) localStorage.setItem(SS_KEY, JSON.stringify(s));
      else localStorage.removeItem(SS_KEY);
    } catch (e) {}
    globalThis.FOX_SESSION = s || null;
    document.dispatchEvent(new CustomEvent('fox:session', { detail: s || null }));
  }
  /* decode a JWT payload without any crypto — only used for `exp` and `phone` */
  function decode(token) {
    try {
      var part = String(token).split('.')[1] || '';
      part = part.replace(/-/g, '+').replace(/_/g, '/');
      while (part.length % 4) part += '=';
      return JSON.parse(decodeURIComponent(escape(atob(part))));
    } catch (e) {
      return {};
    }
  }

  function headers(extra) {
    var h = { 'Content-Type': 'application/json' };
    if (cfg.key) {
      h.apikey = cfg.key;
      h.Authorization = 'Bearer ' + cfg.key;
    }
    var s = globalThis.FOX_SESSION || readSession();
    if (s && s.token) h.Authorization = 'Bearer ' + s.token;
    var d = globalThis.FOX_DEVICE || {};
    if (d.installId) h['x-client-build'] = String(d.installId);
    return Object.assign(h, extra || {});
  }

  /* POST to an edge function and unwrap {ok:false} into a rejected promise */
  function fn(name, body, opts) {
    opts = opts || {};
    if (opts.auth === false && cfg.key) {
      body = Object.assign({ _pub: 1 }, body || {});
      delete body._pub;
    }
    return fetch(cfg.functionsBase + '/' + name, {
      method: 'POST',
      headers: headers({ Prefer: opts.prefer || 'return=representation' }),
      body: JSON.stringify(body || {}),
      mode: 'cors',
      credentials: 'omit'
    }).then(function (res) {
      return res
        .json()
        .catch(function () {
          return { ok: false, error: 'bad_response', msg: 'HTTP ' + res.status };
        })
        .then(function (data) {
          if (!res.ok || data.ok === false) {
            var err = new Error(data.msg || data.message || 'request_failed');
            err.code = data.error || 'http_' + res.status;
            err.status = res.status;
            throw err;
          }
          return data;
        });
    });
  }

  /* realtime: subscribe to one group's stream, nothing else can ever arrive
   * (the postgres_changes filter is server-side AND RLS re-checks it per row) */
  function channel(name, onEvent) {
    if (!globalThis.SupabaseClient && !globalThis.supabase) return null;
    var sb = globalThis.supabase.createClient(cfg.url, cfg.key, { realtime: { params: { eventsPerSecond: 10 } } });
    var ch = sb.channel(name, { config: { broadcast: { self: false }, postgres_changes: true } });
    ch.on('postgres_changes', { event: 'INSERT', schema: 'app', table: 'group_message' }, function (p) {
      onEvent(p.new, 'message');
    });
    return { subscribe: function () { ch.subscribe(); }, unsubscribe: function () { sb.removeChannel(ch); } };
  }

  globalThis.FOX_CFG = cfg;
  globalThis.foxHeaders = headers;
  globalThis.foxFunction = fn;
  globalThis.foxRealtime = channel;
  globalThis.foxSession = {
    get: function () { return readSession(); },
    set: writeSession,
    clear: function () { writeSession(null); },
    claims: function () { var s = readSession(); return s ? decode(s.token) : {}; }
  };
  writeSession(readSession());
})();
