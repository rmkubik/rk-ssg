import { Emitter } from "../emitters/emitter";
import { SsgFile } from "../files/ssgFile";
import { Sourcer } from "../sourcers/sourcer";
import { Transformer } from "../transformers/transformer";

export class Pipeline {
  items: Array<(files: SsgFile[]) => Promise<SsgFile[]>> = [];

  source(sourcer: Sourcer): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const newFiles = await sourcer.source();
      return [...files, ...newFiles];
    });
    return this;
  }

  transform(transformer: Transformer): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const filteredFiles = files.filter((file) => transformer.filter(file));
      await transformer.transform(filteredFiles);
      return files;
    });
    return this;
  }

  emit(emitter: Emitter): Pipeline {
    this.items.push(async (files: SsgFile[]) => {
      const filteredFiles = files.filter((file) => emitter.filter(file));
      await emitter.emit(filteredFiles);
      return files;
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
