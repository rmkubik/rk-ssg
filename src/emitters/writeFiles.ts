import path from "path";
import { SsgFile } from "../files/ssgFile";
import { Emitter } from "./emitter";
import micromatch from "micromatch";

/**
 * Write files to disk who's source relative to origin
 * matches the input glob. Write them to target directory.
 *
 * This uses the file's default copyTo() content. This is
 * usually an untransformed value.
 */
export class WriteFiles extends Emitter {
  constructor(
    private matchingGlobs: string | string[],
    private target: string
  ) {
    super();
  }

  filter(file: SsgFile): boolean {
    return micromatch.isMatch(
      file.source.pathRelativeToOrigin,
      this.matchingGlobs
    );
  }

  emit(files: SsgFile[]): void {
    /**
     * TODO:
     * This logic needs to be manually synced with other file emitters
     */
    files.map((file) => file.copyTo(path.join(this.target, file.outputPath)));
  }
}
