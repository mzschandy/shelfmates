import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import sessionRouter from './routes/sessions/index.js';
import clubRouter from './routes/clubs/index.js';

const api = new Hono().basePath('/api');

api.get('/', (c) => {
  return c.text('Hello Hono!');
});

api.route('/sessions', sessionRouter);
api.route('/clubs', clubRouter);

serve(
  {
    fetch: api.fetch,
    port: 8787,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
