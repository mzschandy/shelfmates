import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@shelfmates/db';
import z, { object } from 'zod';
import { getSupabase, type Env } from '@/middleware/auth.middleware.js';
import { de } from 'zod/locales';

const app = new Hono<Env>();

const threadSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  clubId: z.string().optional(),
  sessionId: z.string().optional(),
  type: z.enum(['SESSION', 'GENERAL']),
});

const threadRouter = app
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            clubMember: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!thread) {
      return c.json({ error: 'Thread not found' }, 404);
    }

    return c.json({ data: thread });
  })
  .post(
    '/thread',
    zValidator('json', threadSchema),
    async (c) => {
      const { title, description, clubId, sessionId, type } =
        await c.req.json();
      const supabase = getSupabase(c);

      console.log('title, description, clubId, sessionId, type', title, description, clubId, sessionId, type);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const clubMember = await prisma.clubMember.findUnique({
        where: {
          userByProfile: {
            profileId: user.id,
            clubId: clubId,
          },
        },
      });

      if (!clubMember) {
        return c.json({ error: 'User is not a member of this club' }, 403);
      }

      const newThread = await prisma.thread.create({
        data: {
          title,
          description: description || null,
          clubId,
          sessionId: sessionId || null,
          type,
        },
      });

      return c.json({ data: newThread }, 201);
    },
  )
  .post(
    '/:id/comments',
    zValidator('param', z.object({ id: z.string() })),
    zValidator(
      'json',
      z.object({
        commentText: z.string().min(1),
        parentId: z.string().optional(),
        clubId: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid('param');
      const { commentText, parentId, clubId } = c.req.valid('json');
      const supabase = getSupabase(c);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Find the club member for this user and club
      const clubMember = await prisma.clubMember.findUnique({
        where: {
          userByProfile: {
            profileId: user.id,
            clubId: clubId,
          },
        },
      });

      if (!clubMember) {
        return c.json({ error: 'User is not a member of this club' }, 403);
      }

      let depth = 0;
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
        });
        if (parentComment) {
          depth = parentComment.depth + 1;
        }
      }

      const newComment = await prisma.comment.create({
        data: {
          commentText,
          threadId: id,
          clubMemberId: clubMember.id,
          parentId: parentId || null,
          depth,
          clubId,
        },
        include: {
          clubMember: {
            include: {
              profile: true,
            },
          },
        },
      });

      return c.json({ data: newComment }, 201);
    },
  );

export default threadRouter;
