import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";

const TEMPLATE_FILE_NAME = "_template.eta";

export class IdentifyEtaTemplates extends Transformer {
  filter(file: SsgFile): boolean {
    return true;
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      if (file.source.absolutePath.endsWith(TEMPLATE_FILE_NAME)) {
        file.transformations.isEtaTemplate = true;
        file.transformations.doNotEmit = true;
      }
    });

    await Promise.all(promises);
  }
}
