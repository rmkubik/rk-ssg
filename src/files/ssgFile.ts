import fs from "fs/promises";
import { FileSource } from "./fileSource";
import path from "path";
import fsExtra from "fs-extra";

export class SsgFile {
  transformations: Map<string, string> = new Map();

  constructor(public source: FileSource) {}

  async copyTo(target: string, content?: string): Promise<void> {
    const finalContent = content ?? (await this.source.read());
    await fsExtra.outputFile(target, finalContent);
  }
}
