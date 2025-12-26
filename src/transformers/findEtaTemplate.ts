import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";

const TEMPLATE_FILE_NAME = "_template.eta";

/**
 * TODO:
 * We need to be able to map /dir/index.md to be output as /dir.html
 */

export class FindEtaTemplate extends Transformer {
  filter(file: SsgFile): boolean {
    return true;
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      const dirContents = await fs.readdir(file.source.directory);
      const doesFileHaveTemplate = dirContents.includes(TEMPLATE_FILE_NAME);

      // This is a normal situation. Not all files should have a template.
      if (!doesFileHaveTemplate) return;

      const template = await fs.readFile(
        path.join(file.source.directory, TEMPLATE_FILE_NAME),
        "utf8"
      );
      file.transformations.etaTemplate = template;
    });

    await Promise.all(promises);
  }
}
