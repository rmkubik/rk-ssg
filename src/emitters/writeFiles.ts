import path from "path";
import { SsgFile } from "../files/ssgFile";
import { Emitter } from "./emitter";
import micromatch from "micromatch";

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
    files.map((file) => file.copyTo(path.join(this.target, file.outputPath)));
  }
}
