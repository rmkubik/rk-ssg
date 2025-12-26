import { SsgFile } from "../files/ssgFile";

export abstract class Sourcer {
  abstract source(): Promise<SsgFile[]>;
}
