import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import micromatch from "micromatch";

export class DoNotEmitMatchingFiles extends Transformer {
  constructor(private targetGlob: string) {
    super();
  }

  filter(file: SsgFile): boolean {
    return true;
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      if (
        micromatch.isMatch(file.source.pathRelativeToOrigin, this.targetGlob)
      ) {
        file.transformations.doNotEmit = true;
      }
    });

    await Promise.all(promises);
  }
}
