import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";
import { recursivelyFindParentFilePath } from "../files/recursivelyFindParentFilePath";
import { COMPONENT_HANDLERS_DIR } from "./IdentifyComponentHandlers";

/**
 * TODO:
 * Right now, we don't handle any sort of component overrides
 * or merging between multiple different component handler directories.
 *
 * In the future, we'll probably want this option.
 */
export class FindComponentHandlers extends Transformer {
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

      const handlersPath = await recursivelyFindParentFilePath(
        COMPONENT_HANDLERS_DIR,
        file.source.directory,
        this.rootDir,
      );

      // This is a normal situation. Not all files should have component handlers.
      if (!handlersPath) return;

      file.transformations.componentHandlerDir = handlersPath;
    });

    await Promise.all(promises);
  }
}
