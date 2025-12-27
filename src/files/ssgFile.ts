import { FileSource } from "./fileSource";
import fsExtra from "fs-extra";
import { FileTransformations } from "../transformers/fileTransformations";
import path from "path";

export class SsgFile {
  transformations: FileTransformations;

  constructor(public source: FileSource) {
    this.transformations = new FileTransformations();
  }

  async copyTo(target: string, content?: string): Promise<void> {
    const finalContent = content ?? (await this.source.read());
    await fsExtra.outputFile(target, finalContent);
  }

  // if htmlContent, .html
  // if baseName, new basename
  get outputPath() {
    const originDirPath = path.dirname(this.source.pathRelativeToOrigin);
    const baseName = this.transformations.baseName ?? this.source.basename;
    const extension = this.transformations.htmlContent
      ? ".html"
      : this.source.extension;

    /**
     * TODO:
     * this almost works how I want it to
     * - i get the write basename for the post now
     * - but now i need to collapse the post to the same root level as the directory
     *   that is taking the basename of...
     *
     * ON THE OTHER HAND...
     * - is it maybe more technically correct to leave these as index.html files anyway......
     */

    return path.join(originDirPath, baseName + extension);
  }
}
