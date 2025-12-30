import { ReadTimeResults } from "reading-time";

export type FrontMatter = Record<string, unknown>;

/**
 * All data that file transformers can attach to a given
 * file. This feels kinda fragile as is. I think it is probably
 * good enough for a while.
 *
 * It's not particularly extensible this way. No end user could
 * create a new pipeline transformer that stores new data in this
 * model.
 */
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
  readingTime?: ReadTimeResults;
}
