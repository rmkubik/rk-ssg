import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";
import micromatch from "micromatch";

export class IdentifyEtaViews extends Transformer {
  constructor(private viewsDirGlob: string) {
    super();
  }

  filter(file: SsgFile): boolean {
    return micromatch.isMatch(
      file.source.pathRelativeToOrigin,
      this.viewsDirGlob
    );
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      file.transformations.isEtaView = true;
    });

    await Promise.all(promises);
  }
}
