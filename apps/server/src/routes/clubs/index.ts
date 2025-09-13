import { zValidator } from '@hono/zod-validator';
import { prisma } from '@shelfmates/db';
import { Hono } from 'hono';
import z from 'zod';
import { transformParam } from '@/utils/transform-param.util.js';
import { getSupabase } from '@/middleware/auth.middleware.js';

const app = new Hono();

const createClubSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  creatorId: z.uuid(),
  threadId: z.array(z.string()).optional(),
});

const clubPermissionsSchema = z.object({
  title: z.string(),
  userId: z.string(),
});

const joinClubSchema = z.object({
  userId: z.string(),
  clubId: z.string(),
});

const clubRouter = app
  //Gets all the clubs
  .get('/all', async (c) => {
    const supabase = getSupabase(c);
    const { data, error } = await supabase.auth.getUser()
    if (error) console.log('server supabase auth error', error)
      console.log('server supabase auth', data.user)
    const clubs = await prisma.club.findMany();
    return c.json({ data: clubs });
  })
  //Gets a club by its title
  .get(
    '/:title',
    zValidator('param', z.object({ title: z.string() })),
    async (c) => {
      // const id = c.req.param('id');
      const { title } = c.req.valid('param');

      const readableTitle = transformParam(title);

      const club = await prisma.club.findFirst({
        where: {
          title: readableTitle,
        },
        include: {
          clubMembers: {
            include: {
              profile: true,
            },
          },
          sessions: true,
        },
      });

      if (!club) {
        return c.json({ error: 'Could not retrieve club' }, 404);
      }
      return c.json({ data: club });
    },
  )
  //Gets all the sessions for a club
  .get('/:id/sessions', (c) => {
    return c.json({ message: 'get all sessions for club' });
  })
  //Gets the permissions for a given user
  .get(
    '/:title/permissions/:userId',
    zValidator('param', clubPermissionsSchema),
    async (c) => {
      // const title = c.req.param('id');
      // const userId = c.req.param('userId');
      const { title, userId } = c.req.valid('param');

      const readableTitle = transformParam(title);

      if (!userId) {
        return c.json(
          { isLoggedIn: false, isMember: false, isAdmin: false },
          404,
        );
      }

      const clubId = await prisma.club.findFirst({
        where: {
          title: readableTitle,
        },
      });

      console.log('server clubId', clubId);

      if (!clubId) {
        return c.json({ error: 'Could not find club' }, 404);
      }

      const clubPermissions = await prisma.clubMember.findUnique({
        where: {
          userByProfile: {
            profileId: userId,
            clubId: clubId.id,
          },
        },
      });

      return c.json({
        data: {
          isLoggedIn: !!userId,
          isMember: !!clubPermissions,
          isAdmin: clubPermissions?.isAdmin ?? false,
        },
      });
    },
  )
  .post('/create', zValidator('form', createClubSchema), async (c) => {
    const { title, isPublic, creatorId, description, threadId } =
      c.req.valid('form');

    const newClub = await prisma.club.create({
      data: {
        title,
        description,
        isPublic: true,
        creatorId: creatorId,
      },
    });

    return c.json({ data: newClub }, 201);
  })
  .post('/join', zValidator('query', joinClubSchema), async (c) => {
    const { clubId, userId } = c.req.valid('query');

    const newMember = await prisma.clubMember.create({
      data: {
        clubId: clubId,
        profileId: userId,
        isAdmin: false,
      },
    });

    return c.json({data: newMember}, 201)
  });

export default clubRouter;
