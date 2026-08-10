import { URL } from "url";
import { SsgFile } from "../files/ssgFile";
import { Pipeline } from "./pipeline";
import { AbsolutePathSourcer } from "../sourcers/absolutePathSourcer";
import { Transformer } from "../transformers/transformer";

export class PipelineContext {
  allFiles: SsgFile[] = [];

  constructor(
    public siteUrl: URL,
    private pipeline: Pipeline,
  ) {}

  get allEtaViews(): SsgFile[] {
    return this.allFiles.filter((file) => file.transformations.isEtaView);
  }

  get allSlugs(): string[] {
    return convertFilesToSlugs(this.allFiles);
  }

  getFileFromSlug(slug: string) {
    return this.allFiles.find((file) => file.slug === slug);
  }

  slugsInDirectory(directory: string): string[] {
    return filterSlugsToDir(this.allSlugs, directory);
  }

  htmlFilesInDirectory(directory: string): SsgFile[] {
    const htmlFiles = this.allFiles.filter((file) => file.isHtml);
    return filterFilesToDir(htmlFiles, directory);
  }

  htmlSlugsInDirectory(directory: string): string[] {
    const htmlFiles = this.allFiles.filter((file) => file.isHtml);
    const htmlSlugs = convertFilesToSlugs(htmlFiles);

    return filterSlugsToDir(htmlSlugs, directory);
  }

  async transformAbsolutePath(
    absolutePath: string,
    rootDirectory: string,
    filterTransformers: (transformer: Transformer) => boolean,
  ): Promise<SsgFile> {
    // Minimal changes would be:
    // clone existing pipeline
    // replace sourcers and emitters though
    // new sourcer is "single file path" or "source by slug"
    // no emitters needed
    const pipeline = this.pipeline
      .copy()
      // .removeAllOfType("sourcer")
      // .removeAllOfType("emitter")
      .removeBy((item) => {
        if (item.definition instanceof Transformer) {
          return filterTransformers(item.definition);
        }

        // Remove all non-transformer pipeline items
        return false;
      })
      .source(
        new AbsolutePathSourcer({
          rootDirectory,
          absolutePath,
        }),
        true,
      );
    const [file] = await pipeline.run();

    return file;
  }
}

function convertFilesToSlugs(files: SsgFile[]): string[] {
  return files
    .filter((file) => !file.transformations.doNotEmit)
    .filter((file) => !file.source.isDirectory)
    .map((file) => file.slug);
}

function filterSlugsToDir(slugs: string[], directory: string): string[] {
  return slugs
    .filter((slug) => slug.startsWith(directory))
    .filter((slug) => slug !== directory);
}

function filterFilesToDir(files: SsgFile[], directory: string): SsgFile[] {
  return files
    .filter((file) => file.slug.startsWith(directory))
    .filter((file) => file.slug !== directory);
}
