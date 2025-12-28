import { SsgFile } from "../files/ssgFile";
import { PipelineContext } from "../pipeline/pipelineContext";

export abstract class Emitter {
  abstract filter(file: SsgFile, context: PipelineContext): boolean;

  abstract emit(files: SsgFile[], context: PipelineContext): void;
}
