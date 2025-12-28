import { Emitter } from "../emitters/emitter";
import { SsgFile } from "../files/ssgFile";
import { log } from "../functional/log";
import { Sourcer } from "../sourcers/sourcer";
import { Transformer } from "../transformers/transformer";
import { PipelineContext } from "./pipelineContext";

export class Pipeline {
  items: Array<(files: SsgFile[]) => Promise<SsgFile[]>> = [];
  context = new PipelineContext();

  source(sourcer: Sourcer): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const newFiles = await sourcer.source(this.context);
      const allFiles = [...files, ...newFiles];
      this.context.allSlugs = allFiles.map(
        (file) => file.source.pathRelativeToOrigin
      );
      return allFiles;
    });
    return this;
  }

  transform(transformer: Transformer): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const filteredFiles = files.filter((file) =>
        transformer.filter(file, this.context)
      );
      await transformer.transform(filteredFiles, this.context);
      return files;
    });
    return this;
  }

  emit(emitter: Emitter): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const filteredFiles = files.filter((file) =>
        emitter.filter(file, this.context)
      );
      await emitter.emit(filteredFiles, this.context);
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

  async run(): Promise<void> {
    let files: SsgFile[] = [];

    for (let item of this.items) {
      files = await item(files);
    }
  }
}
