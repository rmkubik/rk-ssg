import klaw, { Item, Walker } from "klaw";
import through2 from "through2";
import micromatch from "micromatch";
import { SsgFile } from "../files/ssgFile";
import { FileSource } from "../files/fileSource";
import { FileSourceOrigin } from "../files/fileSourceOrigin";
import { Sourcer } from "./sourcer";
import { stat } from "fs/promises";
import path from "path";

export class AbsolutePathSourcer extends Sourcer {
  private absolutePath: string;
  private rootDirectory: string;

  constructor({
    rootDirectory,
    absolutePath,
  }: {
    rootDirectory: string;
    absolutePath: string;
  }) {
    super();

    this.absolutePath = absolutePath;
    this.rootDirectory = rootDirectory;
  }

  async source() {
    const stats = await stat(this.absolutePath);
    return [
      new SsgFile(
        new FileSource(
          this.absolutePath,
          new FileSourceOrigin(this.rootDirectory),
          stats,
        ),
      ),
    ];
  }
}
