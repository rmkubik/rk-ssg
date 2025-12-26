import { FileSource } from "./fileSource";
import fsExtra from "fs-extra";
import { FileTransformations } from "../transformers/fileTransformations";

export class SsgFile {
  transformations: FileTransformations;

  constructor(public source: FileSource) {
    this.transformations = new FileTransformations();
  }

  async copyTo(target: string, content?: string): Promise<void> {
    const finalContent = content ?? (await this.source.read());
    await fsExtra.outputFile(target, finalContent);
  }
}
