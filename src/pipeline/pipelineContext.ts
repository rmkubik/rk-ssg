import { SsgFile } from "../files/ssgFile";

export class PipelineContext {
  allFiles: SsgFile[] = [];

  get allSlugs() {
    return this.allFiles
      .filter((file) => !file.transformations.doNotEmit)
      .filter((file) => !file.source.isDirectory)
      .map((file) => file.slug);
  }
}
