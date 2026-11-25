import fs from "fs/promises";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import path from "path";
import micromatch from "micromatch";

export const COMPONENT_HANDLERS_DIR = "_components";
export const COMPONENT_HANDLERS_GLOB = `**/${COMPONENT_HANDLERS_DIR}/*.eta`;

export class IdentifyComponentHandlers extends Transformer {
  constructor() {
    super();
  }

  filter(file: SsgFile): boolean {
    return micromatch.isMatch(
      file.source.pathRelativeToOrigin,
      COMPONENT_HANDLERS_GLOB,
    );
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      file.transformations.isComponentHandler = true;
    });

    await Promise.all(promises);
  }
}
