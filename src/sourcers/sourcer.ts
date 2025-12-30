import { SsgFile } from "../files/ssgFile";
import { PipelineContext } from "../pipeline/pipelineContext";

/**
 * Locates files from various sources (e.g. a directory on disk) and gets them into the pipeline
 */
export abstract class Sourcer {
  abstract source(context: PipelineContext): Promise<SsgFile[]>;
}
