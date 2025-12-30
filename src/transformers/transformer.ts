import { SsgFile } from "../files/ssgFile";
import { PipelineContext } from "../pipeline/pipelineContext";

export abstract class Transformer {
  abstract filter(file: SsgFile, context: PipelineContext): boolean;

  /**
   * TODO:
   * It feels kinda weird that we have a filter function above that operates on a single
   * file, but this transform function operates on a list of files.
   *
   * Most of the transformers operate on a single file at a time and then need to check for
   * the same filter logic they already filtered for.
   *
   * I think we could change this to operate on a single file at a time. If we actually need
   * a transformer that operates on all files at once, we could create a new kind of transformer
   * at that time.
   */
  abstract transform(files: SsgFile[], context: PipelineContext): Promise<void>;
}
