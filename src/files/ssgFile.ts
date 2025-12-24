import fs from "fs/promises";
import { FileSource } from "./fileSource";
import path from "path";
import fsExtra from "fs-extra";
import { FileTransformations } from "../transformers/fileTransformations";

export class SsgFile {
  transformations: FileTransformations = {};

  constructor(public source: FileSource) {}

  async copyTo(target: string, content?: string): Promise<void> {
    const finalContent = content ?? (await this.source.read());
    await fsExtra.outputFile(target, finalContent);
  }
}
