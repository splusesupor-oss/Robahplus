/**
 * Pinned dependencies for every Robah Plus edge function.
 * Bumping these is a two-line change here + `supabase functions deploy`, never a hunt through
 * individual functions — and `deno check` in CI fails loudly if a pinned version disappears.
 */
export { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
export { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
export { decodeJwt } from 'https://esm.sh/jose@5.6.3';
