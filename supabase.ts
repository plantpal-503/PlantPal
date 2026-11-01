import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const appMode = import.meta.env.VITE_APP_MODE;

export const isDemoMode = appMode === 'demo' || !supabaseUrl || !supabaseAnonKey;

// Only create the real client if credentials are available
export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Running in demo mode.');
  }
  return supabase;
}
