import micromatch from "micromatch";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";

export class RemapPathPublicFiles extends Transformer {
  filter(file: SsgFile): boolean {
    return micromatch.isMatch(
      file.source.pathRelativeToOrigin,
      "public/**/*.*"
    );
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      const parts = file.source.directoryRelativeToOrigin.split(path.sep);
      // first part of parts should always be "public" because of our filter above
      parts.shift();
      file.transformations.outputDirPath = parts.join(path.sep);
    });

    await Promise.all(promises);
  }
}
