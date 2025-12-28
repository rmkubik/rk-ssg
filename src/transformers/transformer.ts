import { SsgFile } from "../files/ssgFile";
import { PipelineContext } from "../pipeline/pipelineContext";

export abstract class Transformer {
  abstract filter(file: SsgFile, context: PipelineContext): boolean;

  abstract transform(files: SsgFile[], context: PipelineContext): Promise<void>;
}
