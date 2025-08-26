import { Hono } from 'hono';

const app = new Hono();

const clubRouter = app
  .get('/')
  .get('/:id', (c) => {
    return c.json({ message: 'get club endpoint' });
  })
  .get('/:id/sessions', (c) => {
    return c.json({ message: 'get all sessions for club' });
  });

export default clubRouter;
