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
import { createMiddleware } from 'hono/factory';

const app = new Hono<Env>();

export type ReaderEnv = Env & {
  Variables: Env['Variables'] & {
    session: ReaderSession;
    profileId: string;
  };
};

//checks if user logged in + is a member of the club and session
const protectedRouteMiddleware = createMiddleware<Env>(async (c, next) => {
  const id = c.req.url.split('/')[5];
  console.log('id from middleware', id);
  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return c.json({ error: 'User not logged in' }, 401);
  }
  const currentUserProfileId = data.user.id;

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
    (member) => member.profileId === currentUserProfileId,
  );

  if (!isUser) {
    return c.json({ error: 'User is not part of the club' }, 403);
  }

  c.set('session', { ...session, currentUserProfileId });
  c.set('profileId', currentUserProfileId);
  await next();
});

export type ReaderSession = {
  title: string;
  createdAt: Date;
  id: string;
  clubId: string;
  isActive: boolean;
  bookId: string | null;
  book: Book | null;
  club: ({ clubMembers: ClubMember[] } & Club) | null;
  annotation: Annotation[];
  currentUserProfileId: string;
} | null;

const annotationSchema = z.object({
  cfiRange: z.string(),
  isPublic: z.boolean().optional(),
  noteText: z.string().optional(),
  annotationId: z.string().optional(),
  type: z.enum(['HIGHLIGHT', 'NOTE']),
  sessionId: z.string(),
  color: z.enum(['YELLOW', 'RED', 'BLUE', 'GREEN']).optional(),
});

const readerRouter = app
  .use(protectedRouteMiddleware)
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const session = c.get('session');
    const supabase = getSupabase(c);
    console.log('session? >', session);

    const { data: bookData, error: bookError } = await supabase.storage
      .from('books')
      .createSignedUrl(`${session?.clubId}/${session?.book?.filePath}`, 3600);

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
      const session = c.get('session');
      const supabase = getSupabase(c);
      const { data, error } = await supabase.auth.getUser();

      const progress = await prisma.userSessionProgress.findFirst({
        where: {
          profileId: data?.user?.id,
          sessionId: session?.id,
        },
      });

      if (!progress) {
        return c.json({ error: 'Could not find progress' });
      }

      return c.json({ data: progress });
    },
  )
  .get('/:id/annotations/all', async (c) => {
    const session = c.get('session');

    const annotations = await prisma.annotation.findMany({
      where: {
        isPublic: true,
        sessionId: session?.id,
      },
    });

    return c.json({ data: annotations });
  })
  .get('/:id/annotations', async (c) => {
    const session = c.get('session');
    const supabase = getSupabase(c);

    const { data, error } = await supabase.auth.getUser();

    const annotations = await prisma.annotation.findMany({
      where: {
        sessionId: session?.id,
        profileId: data?.user?.id,
      },
    });

    return c.json({ data: annotations });
  })
  .post(
    '/:id/progress',
    zValidator('json', z.object({ id: z.string(), lastCfi: z.string() })),
    async (c) => {
      const { id, lastCfi } = c.req.valid('json');
      const supabase = getSupabase(c);
      const session = c.get('session');
      const { data, error } = await supabase.auth.getUser();

      const updatedProgress = await prisma.userSessionProgress.upsert({
        where: {
          profileId_sessionId: {
            profileId: data.user!.id,
            sessionId: session!.id,
          },
        },
        create: {
          lastCFI: lastCfi,
          profileId: data.user!.id,
          sessionId: session!.id,
        },
        update: {
          lastCFI: lastCfi,
          updatedAt: new Date(),
        },
      });

      return c.json({ data: updatedProgress });
    },
  )
  .post('/:id/annotations', zValidator('json', annotationSchema), async (c) => {
    const {
      sessionId,
      cfiRange,
      isPublic,
      noteText,
      type,
      annotationId,
      color,
    } = c.req.valid('json');
    const profileId = c.get('profileId');
    const existingAnnotation = await prisma.annotation.findFirst({
      where: {
        cfiRange,
        profileId,
        sessionId,
      },
    });
    let newAnnotation;

    if (existingAnnotation || annotationId) {
      if (type === 'HIGHLIGHT') {
        newAnnotation = await prisma.annotation.update({
          where: {
            id: existingAnnotation?.id,
          },
          data: {
            isPublic,
            cfiRange,
            color,
          },
        });
      }
      if (type === 'NOTE') {
        newAnnotation = await prisma.annotation.update({
          where: {
            id: existingAnnotation?.id ?? annotationId,
          },
          data: {
            isPublic,
            noteText,
          },
        });
      }
    } else {
      if (type === 'HIGHLIGHT') {
        newAnnotation = await prisma.annotation.create({
          data: {
            profileId,
            sessionId,
            cfiRange,
            isPublic,
            type: 'HIGHLIGHT',
            color,
          },
        });
      }
      if (type === 'NOTE') {
        newAnnotation = await prisma.annotation.create({
          data: {
            sessionId,
            profileId,
            cfiRange,
            noteText,
            isPublic,
            type: 'NOTE',
          },
        });
      }
    }

    if (!newAnnotation) {
      return c.json({ error: 'Error creating annotation' }, 500);
    }

    console.log('new annotation', newAnnotation);

    return c.json({ data: newAnnotation }, 201);
  })
  .delete(
    '/:id/annotations/:annotationId',
    zValidator(
      'param',
      z.object({ id: z.string(), annotationId: z.string() }),
    ),
    async (c) => {
      const { annotationId } = c.req.valid('param');
      const profileId = c.get('profileId');
      const annotation = await prisma.annotation.findUnique({
        where: { id: annotationId },
      });
      if (!annotation) {
        return c.json({ error: 'Annotation not found' }, 404);
      }
      if (annotation.profileId !== profileId) {
        return c.json(
          { error: 'User is not authorized to delete this annotation' },
          403,
        );
      }
      await prisma.annotation.delete({ where: { id: annotationId } });
      return c.json(null, 200);
    },
  );

export default readerRouter;
