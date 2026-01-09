import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { prisma, ThreadType } from '@shelfmates/db';
import { SessionService } from './session.service.js';
import { transformParam } from '@/utils/transform-param.util.js';
import { getSupabase, type Env } from '@/middleware/auth.middleware.js';
import type EPub from 'epub';

const app = new Hono<Env>();
const sessionService = new SessionService();

const epubFileSchema = z.instanceof(File);

const sessionSchema = z.object({
  book: epubFileSchema,
  clubId: z.string(),
  clubMemberId: z.string(),
});

const sessionRouter = app
  .get('/', (c) => {
    return c.json({ message: 'Sessions endpoint' });
  })
  //Get a session by its title
  .get(
    '/:title',
    zValidator('param', z.object({ title: z.string() })),
    async (c) => {
      const { title } = c.req.valid('param');
      const readableTitle = transformParam(title);
      console.log('readable title', readableTitle);
      const session = await prisma.session.findFirst({
        where: {
          title: {
            equals: readableTitle,
            mode: 'insensitive',
          },
        },
        include: {
          club: {
            select: {
              title: true,
            },
          },
          threads: true,
          book: {},
        },
      });

      console.log('session data', session);

      if (!session) {
        return c.json({ error: 'Failed to get session' }, 404);
      }

      return c.json({ data: session });
    },
  )
  .get(
    '/book/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid('param');

      const book = await prisma.book.findUnique({
        where: {
          id,
        },
      });

      if (!book) {
        return c.json({ error: 'Failed to get book' }, 404);
      }

      return c.json({ data: book });
    },
  )
  .get(
    '/:id/threads',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid('param');
      console.log('session id', id);

      const threads = await prisma.thread.findMany({
        where: {
          sessionId: id,
        },
        include: {
          comments: true
        }
      });

      return c.json({ data: threads });
    },
  )
  //Creates a new session with a book object
  .post(
    '/create',
    zValidator('form', sessionSchema, (result, c) => {
      if (!result.success) {
        console.log('zod error', result.error);
        return c.text('Invalid input!!!', 400);
      }
    }),
    async (c) => {
      const supabase = getSupabase(c);

      if (!(await supabase.auth.getUser())) {
        return c.json({ error: 'Not authorized' }, 500);
      }
      const { book: epubFile, clubId, clubMemberId } = c.req.valid('form');

      console.log(
        'epubFile, clubId, clubMemberId',
        epubFile,
        '\n',
        clubId,
        '\n',
        clubMemberId,
      );

      if (!epubFile) {
        return c.json({ error: 'Epub file is required' }, 400);
      }

      const chapters = await sessionService.getEpubChapters(epubFile);
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

        console.log('new sesison', newSession);

        console.log('chapters', chapters);

        if (chapters && chapters.length > 0) {
          await tx.thread.createMany({
            data: chapters.map((chapter: EPub.TocElement) => ({
              title: chapter.title
                ? chapter.title.trim()
                : `Chapter ${chapter.level}`,
              clubId,
              sessionId: newSession.id,
              type: ThreadType.SESSION,
            })),
          });
        }

        const newSessionId = newSession.id;

        const newBook = await tx.book.create({
          data: {
            title: bookMetadata.title ?? '',
            author: bookMetadata.creator?.text || 'Unknown',
            description: bookMetadata.description || '',
            bookCoverUrl: bookMetadata.cover || '',
            filePath: newSessionId.concat('_', epubFile.name),
            sessionId: newSession.id,
            uploadedBy: clubMemberId,
            clubId: clubId,
          },
        });

        console.log('new book', newBook);
        const { error } = await supabase.storage
          .from('books')
          .upload(`${clubId}/${newBook.filePath}`, epubFile);
        if (error) {
          throw new Error('could not upload book');
        }

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
