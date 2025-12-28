import { SsgFile } from "../files/ssgFile";
import { PipelineContext } from "../pipeline/pipelineContext";

export abstract class Sourcer {
  abstract source(context: PipelineContext): Promise<SsgFile[]>;
}
