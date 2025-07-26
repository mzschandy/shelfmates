import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import sessionsRouter from './routes/sessions/index.js';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.route('/sessions', sessionsRouter)

serve(
  {
    fetch: app.fetch,
    port: 8787,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
