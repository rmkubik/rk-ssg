import fs from "fs/promises";
import { FileSourceOrigin } from "./fileSourceOrigin";
import path from "path";

export class FileSource {
  constructor(public absolutePath: string, public origin: FileSourceOrigin) {}

  get pathRelativeToOrigin(): string {
    return path.relative(this.origin.filePath, this.absolutePath);
  }

  get extension(): string {
    return path.extname(this.absolutePath);
  }

  async read(): Promise<string> {
    return await fs.readFile(this.absolutePath, "utf8");
  }

  get directory(): string {
    return path.dirname(this.absolutePath);
  }
}
