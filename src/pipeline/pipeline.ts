import { URL } from "url";
import { Emitter } from "../emitters/emitter";
import { SsgFile } from "../files/ssgFile";
import { log } from "../functional/log";
import { Sourcer } from "../sourcers/sourcer";
import { Transformer } from "../transformers/transformer";
import { PipelineContext } from "./pipelineContext";

type PipelineItem = {
  run: (files: SsgFile[]) => Promise<SsgFile[]>;
  definition: Sourcer | Transformer | Emitter | null;
};

export class Pipeline {
  items: PipelineItem[] = [];
  context: PipelineContext;
  isDebugEnabled: boolean = false;

  constructor(siteUrl: URL) {
    this.context = new PipelineContext(siteUrl, this);
  }

  source(sourcer: Sourcer, prepend: boolean = false): Pipeline {
    const item = {
      run: async (files: SsgFile[]) => {
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
      },
      definition: sourcer,
    };
    if (prepend) {
      this.items.unshift(item);
    } else {
      this.items.push(item);
    }
    return this;
  }

  transform(transformer: Transformer): Pipeline {
    this.items.push({
      run: async (files: SsgFile[]) => {
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
      },
      definition: transformer,
    });
    return this;
  }

  emit(emitter: Emitter): Pipeline {
    this.items.push({
      run: async (files: SsgFile[]) => {
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
      },
      definition: emitter,
    });
    return this;
  }

  log(): Pipeline {
    this.items.push({
      run: (files: SsgFile[]) => {
        log(files);
        return Promise.resolve(files);
      },
      definition: null,
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

  copy(): Pipeline {
    const pipeline = new Pipeline(this.context.siteUrl);
    // We should probably properly clone these items and the
    // definitions. Right now it should be fine since the
    // items don't maintain their own state though.
    pipeline.items = [...this.items];
    return pipeline;
  }

  removeAllOfType(type: "sourcer" | "transformer" | "emitter") {
    this.items = this.items.filter((item) => {
      if (type === "sourcer" && item.definition instanceof Sourcer)
        return false;
      if (type === "transformer" && item.definition instanceof Transformer)
        return false;
      if (type === "emitter" && item.definition instanceof Emitter)
        return false;

      return true;
    });

    return this;
  }

  removeBy(filter: (item: PipelineItem) => boolean) {
    this.items = this.items.filter(filter);

    return this;
  }

  private logDebugMessage(message: string) {
    if (!this.isDebugEnabled) return;

    console.log(message);
  }

  async run(): Promise<SsgFile[]> {
    this.logDebugMessage(`Pipeline starting. ${this.items.length} steps.`);

    let files: SsgFile[] = [];

    for (let item of this.items) {
      files = await item.run(files);
    }

    this.logDebugMessage("Pipeline finished running.");

    return files;
  }
}
