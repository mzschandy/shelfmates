import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createClient } from '@supabase/supabase-js';
import epubMetadata from 'epub-metadata';
import { unlink, writeFile } from 'fs/promises';
import tmp from 'tmp';
import { createHonoClient } from '../../../utils/server.js';
import type { EpubMetadata } from '@shelfmates/shared';

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
    const clubId = formData.get('club_id') as string;
    const clubMemberId = formData.get('club_member_id') as string;
    const supabase = await createHonoClient();

    if (!epubFile) {
      return c.json({ error: 'Epub file is required' }, 400);
    }

    const bookMetadata = await extractMetadata(epubFile);

    if (!bookMetadata) {
      return c.json({ error: 'Failed to extract metadata' }, 500);
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        title: bookMetadata.title,
        is_active: true,
        club_id: clubId,
      })
      .select();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return c.json({ error: 'Failed to create session' }, 500);
    }

    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .insert({
        title: bookMetadata.title,
        author: bookMetadata.creator?.text || 'Unknown',
        description: bookMetadata.description || '',
        book_cover_url: bookMetadata.cover || '',
        file_path: epubFile.name,
        session_id: sessionData[0].id,
        uploaded_by: clubMemberId,
      })
      .select();

    if (bookError) {
      console.error('Error creating book:', bookError);
      return c.json({ error: 'Failed to create book' }, 500);
    }

    const { data: updatedSessionData, error: updatedSessionError } =
      await supabase
        .from('sessions')
        .update({ book_id: bookData[0].id })
        .eq('id', sessionData[0].id)
        .select();

    if (updatedSessionError) {
      console.error('Error updating sessino', updatedSessionError);
      return c.json({ error: 'Failed to update session' }, 500);
    }
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
