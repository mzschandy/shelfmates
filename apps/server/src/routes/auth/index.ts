import { Hono } from 'hono';
import { getSupabase, type Env } from '@/middleware/auth.middleware.js';
import z from 'zod';
import { zValidator } from '@hono/zod-validator';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const SignUpSchema = z.object({
  email: z.email(),
  password: z.string(),
  username: z.string(),
});

const app = new Hono<Env>();

const authRouter = app
  .post('/login', zValidator('form', LoginSchema), async (c) => {
    const supabase = getSupabase(c);
    const { email, password } = c.req.valid('form');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: 'Could not sign in' });
    }

    return c.json({ data: data });
  })
  .post('/signup', zValidator('form', SignUpSchema), async (c) => {
    const supabase = getSupabase(c);
    const { email, password, username } = c.req.valid('form');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      return c.redirect('error');
    }

    return c.json({ data });
  })
  .post('/signout', async (c) => {
    const supabase = getSupabase(c);
    await supabase.auth.signOut();
    return c.json({ data: 'Sign out successful' });
  });

export default authRouter;
