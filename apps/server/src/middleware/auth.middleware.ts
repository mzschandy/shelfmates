import type { Context, MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter'
import { setCookie } from 'hono/cookie';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export const getSupabase = (c: Context) => {
  return c.get('supabase') as SupabaseClient;
}

type SupabaseEnv = {
  BACKEND_SUPABASE_URL: string
  BACKEND_SUPABASE_ANON_KEY: string
}

export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const supabaseEnv = env<SupabaseEnv>(c);
    const supabaseUrl = supabaseEnv.BACKEND_SUPABASE_URL;
    const supabaseAnonKey = supabaseEnv.BACKEND_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error('BACKEND_SUPABASE_URL missing!');
    }
    if (!supabaseAnonKey) {
      throw new Error('BACKEND_SUPABASE_ANON_KEY missing!');
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(c.req.header('Cookie') ?? '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            setCookie(c, name, value, options),
          );
        },
      },
    });
    c.set('supabase', supabase);
    await next();
  };
};
