import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !serviceRole) {
    // On ne jette l'erreur qu'au moment où la route l'utilise réellement
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE manquants (env serveur).');
  }

  _client = createClient(url, serviceRole);
  return _client;
}
