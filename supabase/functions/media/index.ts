import { fail, ok, preflight } from '../_shared/respond.ts';
import { AuthError, context } from '../_shared/context.ts';

/**
 * POST /functions/v1/media
 *   { action: 'sign-upload', kind: 'media'|'avatar'|'group-photo', contentType, bytes, width?, height? }
 *   { action: 'finalize',  objectPath, contentType, bytes, mediaId? }
 *   { action: 'sign-read', objectPath, groupId? }
 *
 * The browser/APK uploads straight to Supabase Storage with a short-lived signed token, so no
 * service key ever reaches a client and no 5 MB base64 blob goes through a function.  The path
 * is always `<phone>/<ulid>.<ext>` — that prefix is what the storage RLS policy in migration
 * 0010 checks, so a user can only ever write inside their own folder.
 */
const LIMITS: Record<string, { max: number; types: string[]; bucket: string }> = {
  media: {
    max: 25 * 1024 * 1024,
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/ogg'],
    bucket: 'fox-media',
  },
  avatar: { max: 2 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'], bucket: 'fox-avatars' },
  'group-photo': { max: 2 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'], bucket: 'fox-group-photos' },
};
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
};

function ulid(): string {
  const t = Date.now().toString(36).padStart(12, '0');
  let r = '';
  const a = new Uint8Array(10);
  crypto.getRandomValues(a);
  for (const n of a) r += n.toString(36).padStart(2, '0');
  return (t + r).slice(0, 26);
}

Deno.serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  if (req.method !== 'POST') return fail('method', 'POST only', 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(b.action ?? '');
  try {
    const ctx = context(req);

    if (action === 'sign-upload') {
      const kind = String(b.kind ?? 'media');
      const cfg = LIMITS[kind];
      if (!cfg) return fail('kind', 'نوع فایل نامعتبر است');
      const contentType = String(b.contentType ?? '');
      if (!cfg.types.includes(contentType)) return fail('type', 'فرمت فایل مجاز نیست', 415);
      const bytes = Number(b.bytes ?? 0);
      if (!Number.isFinite(bytes) || bytes <= 0 || bytes > cfg.max) return fail('size', 'حجم فایل مجاز نیست', 413);
      const path = `${ctx.phone}/${ulid()}.${EXT[contentType] ?? 'bin'}`;
      const { data, error } = await ctx.user.storage.from(cfg.bucket).createSignedUploadUrl(path);
      if (error) return fail('sign', 'خطا در دریافت آدرس آپلود', 500);
      return ok({
        bucket: cfg.bucket,
        path,
        token: data.token,
        uploadUrl: data.signedUrl,
        maxBytes: cfg.max,
        expiresInSec: 600,
      });
    }

    if (action === 'finalize') {
      const path = String(b.objectPath ?? '');
      if (!path.startsWith(`${ctx.phone}/`)) return fail('path', 'مسیر فایل متعلق به شما نیست', 403);
      const bytes = Number(b.bytes ?? 0);
      const { error } = await ctx.user.from('media').insert({
        owner_phone: ctx.phone,
        bucket: String(b.bucket ?? 'fox-media'),
        object_path: path,
        content_type: String(b.contentType ?? 'application/octet-stream'),
        bytes: Number.isFinite(bytes) && bytes > 0 ? Math.floor(bytes) : 1,
        width: b.width ? Number(b.width) : null,
        height: b.height ? Number(b.height) : null,
        group_id: b.groupId ? String(b.groupId) : null,
      }).select('id').single();
      if (error) return fail('media', 'ثبت فایل ناموفق بود', 400);
      return ok({ path, publicUrl: b.bucket === 'fox-media' ? null : publicUrl(path) });
    }

    if (action === 'sign-read') {
      const path = String(b.objectPath ?? '');
      const { data } = await ctx.user.storage.from(String(b.bucket ?? 'fox-media')).createSignedUrl(path, 600);
      if (!data) return fail('sign', 'فایل در دسترس نیست', 403);
      return ok({ url: data.signedUrl, expiresInSec: 600 });
    }

    return fail('unknown_action', 'action ناشناخته است', 400);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code, e.message, e.status);
    console.error('[media]', e);
    return fail('server_error', 'خطای سرور', 500);
  }
});

function publicUrl(path: string): string {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const bucket = path.startsWith('avatars/') ? 'fox-avatars' : 'fox-group-photos';
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
