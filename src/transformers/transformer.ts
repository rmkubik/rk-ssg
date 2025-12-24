import { SsgFile } from "../files/ssgFile";

export abstract class Transformer {
  abstract filter(file: SsgFile): boolean;

  abstract transform(files: SsgFile[]): Promise<void>;
}
