import path from "path";
import { SsgFile } from "../files/ssgFile";
import { Emitter } from "./emitter";
import micromatch from "micromatch";

/**
 * Write files to disk who's source relative to origin
 * matches the input glob. Write them to target directory.
 *
 * This uses the file's default copyTo() content. This emitter
 * uses the file's transformed htmlContent instead.
 */
export class WriteHtmlContentFiles extends Emitter {
  constructor(private target: string) {
    super();
  }

  filter(file: SsgFile): boolean {
    return !!file.transformations.htmlContent;
  }

  emit(files: SsgFile[]): void {
    /**
     * TODO:
     * This logic needs to be manually synced with other file emitters
     */
    files.map((file) =>
      file.copyTo(
        path.join(this.target, file.outputPath),
        file.transformations.htmlContent
      )
    );
  }
}
