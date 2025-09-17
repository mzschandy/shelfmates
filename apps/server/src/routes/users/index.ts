import { prisma } from '@shelfmates/db';
import { Hono } from 'hono';
import { getSupabase, type Env } from '@/middleware/auth.middleware.js';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';

const app = new Hono<Env>();

const usersRouter = app
  //Gets the current logged in user
  .get('/current-user', async (c) => {
    const supabase = getSupabase(c);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const profile = await prisma.profile.findUnique({
      where: {
        id: user?.id,
      },
    });

    if (!profile) {
      return c.json({ message: 'User not found' }, 400);
    }

    return c.json({ data: profile });
  })
  //Gets a user profile by a user id
  .get(
    '/user-by-id/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid('param');

      const profile = await prisma.profile.findUnique({
        where: {
          id,
        },
      });

      if (!profile) {
        return c.json({ message: 'User not found' }, 400);
      }

      return c.json({ data: profile });
    },
  );

export default usersRouter;
