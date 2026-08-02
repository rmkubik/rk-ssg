import readingTime from "reading-time";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";

export class ComputeReadingTime extends Transformer {
  constructor() {
    super();
  }

  /**
   * reading-time seems to be very slow when it is parsing some types
   * of files. I noticed this transformer being drastically slower
   * then other transformers, an order of magnitude.
   *
   * I'm not positive the relation between file size, type, or just
   * sheer file count.
   *
   * Around 20 .gifs rook around 3 seconds to be parsed. An order of
   * magnitude higher than other short file counts.
   *
   * Because of this, I'm hoping that limiting this extension to text
   * formats will be sufficient. We may need to look for a better solution
   * in the future though.
   */
  filter(file: SsgFile): boolean {
    return (
      file.source.extension === ".md" ||
      file.source.extension === ".txt" ||
      file.source.extension === ".html"
    );
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      // TODO:
      // We should probably filter this more intelligently
      if (file.source.isDirectory) return;

      // TODO:
      // This isn't really the more correct way to estimate read time?
      // Technically, I should be parsing read time from the actual processed
      // templates and such... But, I need this read time estimate to put into
      // my templates so I'm doing it here for now. I'm assuming this will be...
      // "good enough" for now.
      const text = await file.source.read();
      const stats = readingTime(text);
      file.transformations.readingTime = stats;
    });

    await Promise.all(promises);
  }
}
