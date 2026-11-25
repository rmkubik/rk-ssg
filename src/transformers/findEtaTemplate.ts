import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";
import { recursivelyFindParentFilePath } from "../files/recursivelyFindParentFilePath";

/**
 * TODO:
 * This should be shared with other places that reference this string.
 */
const TEMPLATE_FILE_NAME = "_template.eta";

export class FindEtaTemplate extends Transformer {
  constructor(private rootDir: string) {
    super();
  }

  filter(file: SsgFile): boolean {
    return true;
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      // Eta files don't use templates in this way. They can manually
      // include any templates they need in their own specification.
      if (file.source.extension === ".eta") return;

      const templatePath = await recursivelyFindParentFilePath(
        TEMPLATE_FILE_NAME,
        file.source.directory,
        this.rootDir,
      );

      // This is a normal situation. Not all files should have a template.
      if (!templatePath) return;

      const template = await fs.readFile(templatePath, "utf8");
      file.transformations.etaTemplate = template;
    });

    await Promise.all(promises);
  }
}
