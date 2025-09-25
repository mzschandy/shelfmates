import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware, type Env } from './middleware/auth.middleware.js';
import dotenv from 'dotenv/config';

import sessionRouter from './routes/sessions/index.js';
import clubRouter from './routes/clubs/index.js';
import authRouter from './routes/auth/index.js';
import usersRouter from './routes/users/index.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import readerRouter from './routes/reader/index.js';

const api = new Hono<Env>()
  .basePath('/api')
  .use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  )
  .use(authMiddleware())
  .route('/auth', authRouter)
  .route('/users', usersRouter)
  .route('/clubs', clubRouter)
  .route('/sessions', sessionRouter)
  .route('/reader', readerRouter);

serve(
  {
    fetch: api.fetch,
    port: 8787,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export default api;
export type AppType = typeof api;
