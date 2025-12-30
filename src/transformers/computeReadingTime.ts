import readingTime from "reading-time";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";

export class ComputeReadingTime extends Transformer {
  constructor() {
    super();
  }

  filter(file: SsgFile): boolean {
    return true;
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
