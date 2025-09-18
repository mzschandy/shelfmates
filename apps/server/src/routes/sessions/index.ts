import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { prisma } from '@shelfmates/db';
import { SessionService } from './session.service.js';
import { transformParam } from '@/utils/transform-param.util.js';

const app = new Hono();
const sessionService = new SessionService();

const sessionSchema = z.object({
  book: z.file(),
  clubId: z.string(),
  clubMemberId: z.string(),
});

const sessionRouter = app
  .get('/', (c) => {
    return c.json({ message: 'Sessions endpoint' });
  })
  //Get a session by its title
  .get('/:title', zValidator('param', z.object({title: z.string()})), async (c) => {
    const {title} = c.req.valid('param')
    const readableTitle = transformParam(title);
    
    const session = await prisma.session.findFirst({
      where: {
        title: readableTitle,
      },
      include: {
        club: {
          select: {
            title: true
          }
        }
      }
    });

    console.log('session data', session);

    if (!session) {
      return c.json({ error: 'Failed to get session' }, 404);
    }

    return c.json({ data: session });
  })
  //Creates a new session with a book object
  .post(
    '/create',
    zValidator('json', sessionSchema, (result, c) => {
      if (!result.success) {
        return c.text('Invalid input', 400);
      }
    }),
    async (c) => {
      const formData = await c.req.formData();
      const epubFile = formData.get('book') as File;
      const clubId = formData.get('clubId') as string;
      const clubMemberId = formData.get('clubMemberId') as string;

      if (!epubFile) {
        return c.json({ error: 'Epub file is required' }, 400);
      }

      const bookMetadata = await sessionService.extractMetadata(epubFile);

      if (!bookMetadata || !bookMetadata.title) {
        return c.json({ error: 'Failed to extract metadata' }, 500);
      }

      const newSession = await prisma.$transaction(async (tx) => {
        const newSession = await tx.session.create({
          data: {
            title: bookMetadata.title ?? '',
            isActive: true,
            clubId: clubId,
          },
        });

        const newBook = await tx.book.create({
          data: {
            title: bookMetadata.title ?? '',
            author: bookMetadata.creator?.text || 'Unknown',
            description: bookMetadata.description || '',
            bookCoverUrl: bookMetadata.cover || '',
            filePath: epubFile.name,
            sessionId: newSession.id,
            uploadedBy: clubMemberId,
            clubId: clubId,
          },
        });

        const updatedSession = await tx.session.update({
          where: {
            id: newSession.id,
          },
          data: {
            bookId: newBook.id,
          },
        });

        return updatedSession;
      });

      console.log('updatedSessionData', newSession);

      return c.json({ data: newSession }, 201);
    },
  );

export default sessionRouter;
