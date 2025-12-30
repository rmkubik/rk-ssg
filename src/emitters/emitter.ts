import { SsgFile } from "../files/ssgFile";
import { PipelineContext } from "../pipeline/pipelineContext";

/**
 * Uses transformed file data to write files to disk
 */
export abstract class Emitter {
  abstract filter(file: SsgFile, context: PipelineContext): boolean;

  abstract emit(files: SsgFile[], context: PipelineContext): void;
}
