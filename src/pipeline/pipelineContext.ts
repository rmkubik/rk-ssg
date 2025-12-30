import { URL } from "url";
import { SsgFile } from "../files/ssgFile";

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

export class PipelineContext {
  allFiles: SsgFile[] = [];

  constructor(public siteUrl: URL) {}

  get allEtaViews(): SsgFile[] {
    return this.allFiles.filter((file) => file.transformations.isEtaView);
  }

  get allSlugs(): string[] {
    return convertFilesToSlugs(this.allFiles);
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
}
