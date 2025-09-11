import epubMetadata from 'epub-metadata';
import { unlink, writeFile } from 'fs/promises';
import tmp from 'tmp';
import type { EpubMetadata } from '@shelfmates/shared';

export class SessionService {
  async extractMetadata(epubFile: File) {
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
}
