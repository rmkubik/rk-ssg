import { SsgFile } from "../files/ssgFile";

export abstract class Emitter {
  abstract filter(file: SsgFile): boolean;

  abstract emit(files: SsgFile[]): void;
}
