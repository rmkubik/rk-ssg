import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path, { basename } from "path";

export class UseDirectoryAsNameForIndex extends Transformer {
  filter(file: SsgFile): boolean {
    return file.source.basename === "index";
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      const dirBasename = path.basename(file.source.directory);
      if (!dirBasename) {
        console.error(
          `Tried to get dirBasename of ${file.source.absolutePath}, but failed.`
        );
        return;
      }
      file.transformations.baseName = dirBasename;
    });

    await Promise.all(promises);
  }
}
