import epubMetadata from 'epub-metadata';
import { unlink, writeFile } from 'fs/promises';
import tmp from 'tmp';
import type { EpubMetadata } from '@shelfmates/shared';
import EPub from 'epub';

export class SessionService {
  async extractMetadata(epubFile: File): Promise<EPub.Metadata | undefined> {
    const arrayBuffer = await epubFile.arrayBuffer();
        console.log('arrayBuffer length', arrayBuffer.byteLength)

    const buffer = Buffer.from(arrayBuffer);
    console.log('buffer length', buffer.length)

    const tempFile = tmp.fileSync({ postfix: '.epub' });
    console.log('temp file name', tempFile.name);
    await writeFile(tempFile.name, buffer);

    return new Promise<EPub.Metadata>((resolve, reject) => {
      const epub = new EPub(tempFile.name);
      epub.on('error', function (err) {
        unlink(tempFile.name).catch(() => {});
        console.log('ERROR not creating chapters');
        reject(err);
      });

      epub.on('end', () => {
        unlink(tempFile.name).catch(() => {});
        console.log('metadata extracted:', epub.metadata);
        resolve(epub.metadata);
      });

      epub.parse();
    })

    try {
      // const metadata: EpubMetadata = await (
      //   epubMetadata as (file: string) => Promise<EpubMetadata>
      // )(tempFile.name);
      console.log('metadata extracted:', metadata);
      await unlink(tempFile.name);

      return metadata;
    } catch (err) {
      console.log('Error extracting metadata:', err);
      await unlink(tempFile.name).catch(() => {});
    }
  }

  async getEpubChapters(epubFile: File) {
    const arrayBuffer = await epubFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempFile = tmp.fileSync({ postfix: '.epub' });
    await writeFile(tempFile.name, buffer);

    return new Promise<EPub.TocElement[]>((resolve, reject) => {
      const epub = new EPub(tempFile.name);
      epub.on('error', function (err) {
        unlink(tempFile.name).catch(() => {});
        console.log('ERROR not creating chapters');
        reject(err);
      });

      epub.on('end', () => {
        unlink(tempFile.name).catch(() => {});
        resolve(epub.toc);
      });

      epub.parse();
    })
  }
}
