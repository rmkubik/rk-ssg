import { URL } from "url";
import { Emitter } from "../emitters/emitter";
import { SsgFile } from "../files/ssgFile";
import { log } from "../functional/log";
import { Sourcer } from "../sourcers/sourcer";
import { Transformer } from "../transformers/transformer";
import { PipelineContext } from "./pipelineContext";

export class Pipeline {
  items: Array<(files: SsgFile[]) => Promise<SsgFile[]>> = [];
  context: PipelineContext;
  isDebugEnabled: boolean = false;

  constructor(siteUrl: URL) {
    this.context = new PipelineContext(siteUrl);
  }

  source(sourcer: Sourcer): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const startTime = Date.now();
      this.logDebugMessage(
        `Running pipeline sourcer: ${sourcer.constructor.name}. Starting file count: ${files.length}`,
      );

      const newFiles = await sourcer.source(this.context);
      const allFiles = [...files, ...newFiles];
      this.context.allFiles = allFiles;

      this.logDebugMessage(
        `Completed pipeline sourcer: ${sourcer.constructor.name} in ${Date.now() - startTime}ms. Sourced ${newFiles.length} files.`,
      );

      return allFiles;
    });
    return this;
  }

  transform(transformer: Transformer): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const startTime = Date.now();

      const filteredFiles = files.filter((file) =>
        transformer.filter(file, this.context),
      );

      this.logDebugMessage(
        `Running pipeline transformer: ${transformer.constructor.name}. Filtered file count: ${filteredFiles.length}`,
      );

      await transformer.transform(filteredFiles, this.context);

      this.logDebugMessage(
        `Completed pipeline transformer: ${transformer.constructor.name} in ${Date.now() - startTime}ms`,
      );

      return files;
    });
    return this;
  }

  emit(emitter: Emitter): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const startTime = Date.now();

      const filteredFiles = files.filter((file) =>
        emitter.filter(file, this.context),
      );

      this.logDebugMessage(
        `Running pipeline emitter: ${emitter.constructor.name}. Filtered file count: ${filteredFiles.length}`,
      );

      await emitter.emit(filteredFiles, this.context);

      this.logDebugMessage(
        `Completed pipeline emitter: ${emitter.constructor.name} in ${Date.now() - startTime}ms`,
      );

      return files;
    });
    return this;
  }

  log(): Pipeline {
    this.items.push((files: SsgFile[]) => {
      log(files);
      return Promise.resolve(files);
    });
    return this;
  }

  /**
   * Enable debug to see information about this pipeline while running.
   * Useful for improving pipeline performance or otherwise investigating
   * pipeline issues.
   */
  enableDebug(): Pipeline {
    this.isDebugEnabled = true;
    return this;
  }

  private logDebugMessage(message: string) {
    if (!this.isDebugEnabled) return;

    console.log(message);
  }

  async run(): Promise<void> {
    this.logDebugMessage(`Pipeline starting. ${this.items.length} steps.`);

    let files: SsgFile[] = [];

    for (let item of this.items) {
      files = await item(files);
    }

    this.logDebugMessage("Pipeline finished running.");
  }
}
