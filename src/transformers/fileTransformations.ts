export type FrontMatter = Record<string, unknown>;

export class FileTransformations {
  htmlContent?: string;
  matter?: FrontMatter;
  isEtaTemplate?: boolean;
  isEtaView?: boolean;
  etaTemplate?: string;
  // Override default output basename
  baseName?: string;
  // Override default outputPath, relative to origin
  outputDirPath?: string;
  doNotEmit?: boolean;
}
