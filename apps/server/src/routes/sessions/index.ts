import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createClient } from '@supabase/supabase-js';
import Epub, { Book } from 'epubjs';
import ePub from 'epubjs';
import epubMetadata from 'epub-metadata';
import { unlink, writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';
import fs from 'fs';
import tmp from 'tmp';


const app = new Hono();

interface Metadata {
  publisher?: string;
  description?: string;
  language?: string;
  creator?: {
    [key: string]: string;
    role: string;
    text: string;
  };
  title?: string;
  date?: string;
  contributer?: {
    role: string;
    text: string;
  };
  subject?: string[];
  cover?: string;
  isbn?: string;
  uuid?: string;
  coverPath?: string;
  [key: string]: any;
}

const sessionsRouter = app
  .get('/', (c) => {
    return c.text('Hello Hono!');
  })
  .get('/sessions', (c) => {
    return c.json({ message: 'Sessions endpoint' });
  })
  .post('/create-session', async (c) => {
    const formData = await c.req.formData();
    const epubFile = formData.get('book') as File;

    if (!epubFile) {
      return c.json({ error: 'Epub file is required' }, 400);
    }

    const arrayBuffer = await epubFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempFile = tmp.fileSync({ postfix: '.epub' });
    await writeFile(tempFile.name, buffer);

    try {
      const metadata: Metadata = await (epubMetadata as (file: string) => Promise<Metadata>)(tempFile.name);
      await unlink(tempFile.name);

      return c.json({
        ...metadata,
        message: 'Metadata extraction successful',
      });
    } catch (err) {
      console.log('Error extracting metadata:', err);
      await unlink(tempFile.name).catch(() => {});

      return c.json(
        { error: 'Failed to extract metadata', details: String(err) },
        500,
      );
    }
  });

export default sessionsRouter;
