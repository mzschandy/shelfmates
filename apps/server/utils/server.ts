import { createClient } from '@supabase/supabase-js';

export async function createSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
);
}
