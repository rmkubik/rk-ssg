import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";

/**
 * TODO:
 * This should be shared with other places that reference this string.
 */
const TEMPLATE_FILE_NAME = "_template.eta";

export class FindEtaTemplate extends Transformer {
  filter(file: SsgFile): boolean {
    return true;
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      // Eta files don't use templates in this way. They can manually
      // include any templates they need in their own specification.
      if (file.source.extension === ".eta") return;

      const dirContents = await fs.readdir(file.source.directory);
      const doesFileHaveTemplateAtSameDirLevel =
        dirContents.includes(TEMPLATE_FILE_NAME);

      const parentDir = path.dirname(file.source.directory);
      const parentDirContents = await fs.readdir(parentDir);
      const doesParentDirHaveTemplate =
        parentDirContents.includes(TEMPLATE_FILE_NAME);

      /**
       * Prefer a _template file in the same directory as your file. If one
       * doesn't exist, then check the parent of your current file.
       *
       * TODO:
       * - We might only want to check for a parent file if this file is an
       *   index file specifically.
       * - We might instead want to just recursively check for _template files
       *   instead.
       * Either way, this should be good enough as is for now.
       */
      let templatePath = undefined;
      if (doesFileHaveTemplateAtSameDirLevel) {
        templatePath = path.join(file.source.directory, TEMPLATE_FILE_NAME);
      } else if (doesParentDirHaveTemplate) {
        templatePath = path.join(parentDir, TEMPLATE_FILE_NAME);
      }

      // This is a normal situation. Not all files should have a template.
      if (!templatePath) return;

      const template = await fs.readFile(templatePath, "utf8");
      file.transformations.etaTemplate = template;
    });

    await Promise.all(promises);
  }
}
