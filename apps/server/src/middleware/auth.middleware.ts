import type { Context, MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter';
import { getCookie, setCookie } from 'hono/cookie';
import {
  createServerClient,
  parseCookieHeader,
  type CookieOptions,
} from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReaderSession } from '@/routes/reader/index.js';

export const getSupabase = (c: Context<Env>) => {
  return c.var.supabase as SupabaseClient;
};

type SupabaseEnv = {
  BACKEND_SUPABASE_URL: string;
  BACKEND_SUPABASE_ANON_KEY: string;
};

export type Env = {
  Variables: {
    supabase: SupabaseClient;
    session: ReaderSession;
    profileId: string;
  };
};

export const authMiddleware = (): MiddlewareHandler<Env> => {
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

    const cookiesJar: {
      name: string;
      value: string;
      options: CookieOptions;
    }[] = [];

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(c.req.header('Cookie') ?? '');
        },
        setAll(cookieJar) {
          cookieJar.forEach((cookie) => cookiesJar.push(cookie));
        },
      },
    });

    await supabase.auth.getUser();

    c.set('supabase', supabase);
    await next();

    if (c.res && cookiesJar.length > 0) {
      cookiesJar.forEach(({ name, value, options }) => {
        setCookie(c, name, value, {
          ...options,
          secure: false,
          sameSite: 'lax',
          path: '/',
        });
      });
    }
  };
};
