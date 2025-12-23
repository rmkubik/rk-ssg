import fs from "fs/promises";
import { FileSource } from "./fileSource";
import path from "path";
import fsExtra from "fs-extra";

export class SsgFile {
  constructor(public absolutePath: string, public source: FileSource) {}

  get pathRelativeToSource() {
    return path.relative(this.source.filePath, this.absolutePath);
  }

  async read(): Promise<string> {
    return await fs.readFile(this.absolutePath, "utf8");
  }

  async copyTo(target: string) {
    const content = await this.read();
    await fsExtra.outputFile(target, content);
  }
}
