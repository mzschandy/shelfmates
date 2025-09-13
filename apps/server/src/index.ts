import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import sessionRouter from './routes/sessions/index.js';
import clubRouter from './routes/clubs/index.js';
import authRouter from './routes/auth/index.js';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth.middleware.js';
import dotenv from 'dotenv/config';

const api = new Hono().basePath('/api');

api.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

api.use(authMiddleware());

const routes = api
  .route('/sessions', sessionRouter)
  .route('/clubs', clubRouter)
  .route('/auth', authRouter);

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
export type AppType = typeof routes;
