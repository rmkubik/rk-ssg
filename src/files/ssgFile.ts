import fs from "fs/promises";
import { FileSource } from "./fileSource";
import path from "path";
import fsExtra from "fs-extra";

export class SsgFile {
  transformations: Map<string, string> = new Map();

  constructor(public absolutePath: string, public source: FileSource) {}

  get pathRelativeToSource(): string {
    return path.relative(this.source.filePath, this.absolutePath);
  }

  get extension(): string {
    return path.extname(this.absolutePath);
  }

  async read(): Promise<string> {
    return await fs.readFile(this.absolutePath, "utf8");
  }

  async copyTo(target: string, content?: string): Promise<void> {
    const finalContent = content ?? (await this.read());
    await fsExtra.outputFile(target, finalContent);
  }
}
