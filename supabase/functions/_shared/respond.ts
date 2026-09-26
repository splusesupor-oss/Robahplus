/**
 * One response shape for the whole API, so the web client and the Android APK can treat
 * the legacy Cloudflare Worker (`{ ok, error, msg, … }`) and the new Supabase backend the
 * same way.  Persian user-facing strings live here; the legacy worker used the same keys.
 */
export interface FoxResponseInit {
  status?: number;
  headers?: Record<string, string>;
}

const CORS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization,apikey,x-fox-admin-code,content-type,x-client-build,timezone',
  'access-control-allow-methods': 'POST, GET, OPTIONS',
  'access-control-max-age': '86400',
  'content-type': 'application/json; charset=utf-8',
};

export function json(body: unknown, { status = 200, headers = {} }: FoxResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, ...headers } });
}

/** Legacy-compatible success envelope. */
export function ok(data: Record<string, unknown> = {}, status = 200): Response {
  return json({ ok: true, ...data }, { status });
}

/** Legacy-compatible failure envelope: `error` is the machine code, `msg`/`message` the Persian text. */
export function fail(error: string, message: string, status = 400, extra: Record<string, unknown> = {}): Response {
  return json({ ok: false, error, msg: message, message, ...extra }, { status });
}

export function preflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response(null, { status: 204, headers: CORS }) : null;
}
