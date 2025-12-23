import klaw, { Item, Walker } from "klaw";
import through2 from "through2";
import micromatch from "micromatch";
import { SsgFile } from "../files/ssgFile";
import { FileSource } from "../files/fileSource";

const excludedGlobsFilter = (excludedGlobs: string[]) =>
  through2.obj(function (item, enc, next) {
    if (!micromatch.isMatch(item.path, excludedGlobs)) this.push(item);
    next();
  });

export async function crawlDirectory({
  directory,
  blockList = [],
}: {
  directory: string;
  blockList?: string[];
}): Promise<SsgFile[]> {
  return new Promise((resolve, reject) => {
    const paths: SsgFile[] = [];

    klaw(directory)
      .pipe(excludedGlobsFilter(blockList))
      .on("readable", async function (this: Walker) {
        const item = this.read();
        if (!item) return;
        paths.push(new SsgFile(item.path, new FileSource(directory)));
      })
      .on("error", (err: Error, item: Item) => {
        reject(err);
      })
      .on("end", () => {
        resolve(paths);
      });
  });
}
