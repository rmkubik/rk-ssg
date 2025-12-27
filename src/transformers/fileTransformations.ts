export type FrontMatter = Record<string, unknown>;

export class FileTransformations {
  htmlContent?: string;
  matter?: FrontMatter;
  etaTemplate?: string;
  baseName?: string;
}
