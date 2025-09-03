import { Hono } from 'hono';
import epubMetadata from 'epub-metadata';
import { unlink, writeFile } from 'fs/promises';
import tmp from 'tmp';
import type { EpubMetadata } from '@shelfmates/shared';
import { prisma } from '@shelfmates/db';

const app = new Hono();

const sessionRouter = app
  .get('/', (c) => {
    return c.json({ message: 'Sessions endpoint' });
  })
  //Get a session by its id
  .get('/:id', (c) => {
    return c.json({ message: 'get session endpoint' });
  })
  //Creates a new session with a book object
  .post('/create-session', async (c) => {
    const formData = await c.req.formData();
    const epubFile = formData.get('book') as File;
    const clubId = formData.get('clubId') as string;
    const clubMemberId = formData.get('clubMemberId') as string;


    if (!epubFile) {
      return c.json({ error: 'Epub file is required' }, 400);
    }

    const bookMetadata = await extractMetadata(epubFile);

    if (!bookMetadata || !bookMetadata.title) {
      return c.json({ error: 'Failed to extract metadata' }, 500);
    }

    const updatedTtransaction = await prisma.$transaction(async (tx) => {
      const newSession = await tx.session.create({
        data: {
          title: bookMetadata.title,
          isActive: true,
          clubId: clubId,
        },
      });

      const newBook = await tx.book.create({
        data: {
          title: bookMetadata.title,
          author: bookMetadata.creator?.text || 'Unknown',
          description: bookMetadata.description || '',
          bookCoverUrl: bookMetadata.cover || '',
          filePath: epubFile.name,
          sessionId: newSession.id,
          uploadedBy: clubMemberId,
          clubId: clubId
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

    console.log('updatedSessionData', updatedTtransaction);

    return c.json({ sessionData: updatedTtransaction }, 201);
  });

async function extractMetadata(epubFile: File) {
  const arrayBuffer = await epubFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tempFile = tmp.fileSync({ postfix: '.epub' });
  await writeFile(tempFile.name, buffer);

  try {
    const metadata: EpubMetadata = await (
      epubMetadata as (file: string) => Promise<EpubMetadata>
    )(tempFile.name);
    await unlink(tempFile.name);

    return metadata;
  } catch (err) {
    console.log('Error extracting metadata:', err);
    await unlink(tempFile.name).catch(() => {});
  }
}

export default sessionRouter;
