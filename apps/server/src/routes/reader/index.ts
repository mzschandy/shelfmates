import { getSupabase, type Env } from '@/middleware/auth.middleware.js';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@shelfmates/db';
import { Hono } from 'hono';
import z from 'zod';
import type {
  Annotation,
  Book,
  Club,
  ClubMember,
  Session,
} from '@shelfmates/db';

const app = new Hono<Env>();

type ReaderSession = {
  title: string;
  createdAt: Date;
  id: string;
  clubId: string;
  isActive: boolean;
  bookId: string | null;
  book: Book | null;
  club: ({ clubMembers: ClubMember[] } & Club) | null;
  annotation: Annotation[];
} | null;

const readerRouter = app
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const supabase = getSupabase(c);
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return c.json({ error: 'User not logged in' }, 500);
    }

    const session: ReaderSession = await prisma.session.findUnique({
      where: { id },
      include: {
        club: {
          include: {
            clubMembers: true,
          },
        },
        book: true,
        annotation: true,
      },
    });

    if (!session) {
      return c.json({ error: 'Could not retrieve session' }, 404);
    }

    const isUser = session.club?.clubMembers.find(
      (member) => member.profileId === data.user.id,
    );

    if (!isUser) {
      return c.json({ error: 'User is not part of the club' }, 500);
    }

    console.log('is user part of club?', isUser);
    console.log('session?', session);

    const { data: bookData, error: bookError } = await supabase.storage
      .from('books')
      .createSignedUrl(`${session.clubId}/${session.book?.filePath}`, 3600);

    if (bookError) {
      return c.json({ error: 'Could not get book' });
    }
    console.log('book to download', bookData);

    return c.json(
      {
        data: {
          session,
          epubUrl: bookData,
        },
      },
      200,
    );
  })
  .get(
    '/:id/progress',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const supabase = getSupabase(c);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return c.json({ error: 'User not logged in' }, 500);
      }

      const session: ReaderSession = await prisma.session.findUnique({
        where: { id },
        include: {
          club: {
            include: {
              clubMembers: true,
            },
          },
          book: true,
          annotation: true,
        },
      });

      if (!session) {
        return c.json({ error: 'Could not retrieve session' }, 404);
      }

      const isUser = session.club?.clubMembers.find(
        (member) => member.profileId === data.user.id,
      );

      if (!isUser) {
        return c.json({ error: 'User is not part of the club' }, 500);
      }

      const progress = await prisma.userSessionProgress.findFirst({
        where: {
          profileId: data.user.id,
          sessionId: session.id,
        },
      });

      if (!progress) {
        return c.json({ error: 'Could not find progress' });
      }

      return c.json({ data: progress });
    },
  )
  .post(
    '/:id/progress',
    zValidator('json', z.object({ id: z.string(), lastCfi: z.string() })),
    async (c) => {
      const { id, lastCfi } = c.req.valid('json');
      const supabase = getSupabase(c);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return c.json({ error: 'User not logged in' }, 500);
      }

      const session: ReaderSession = await prisma.session.findUnique({
        where: { id },
        include: {
          club: {
            include: {
              clubMembers: true,
            },
          },
          book: true,
          annotation: true,
        },
      });

      if (!session) {
        return c.json({ error: 'Could not retrieve session' }, 404);
      }

      const isUser = session.club?.clubMembers.find(
        (member) => member.profileId === data.user.id,
      );

      if (!isUser) {
        return c.json({ error: 'User is not part of the club' }, 500);
      }

      const updatedProgress = await prisma.userSessionProgress.upsert({
        where: {
          profileId_sessionId: {
            profileId: data.user.id,
            sessionId: session.id,
          },
        },
        create: {
          lastCFI: lastCfi,
          profileId: data.user.id,
          sessionId: session.id,
        },
        update: {
          lastCFI: lastCfi,
        },
      });

      return c.json({ data: updatedProgress });
    },
  );

export default readerRouter;
