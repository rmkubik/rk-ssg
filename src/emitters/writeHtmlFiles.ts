import path from "path";
import { SsgFile } from "../files/ssgFile";
import { Emitter } from "./emitter";
import micromatch from "micromatch";

export class WriteHtmlFiles extends Emitter {
  constructor(private target: string) {
    super();
  }

  filter(file: SsgFile): boolean {
    return !!file.transformations.get("htmlContent");
  }

  emit(files: SsgFile[]): void {
    files.map((file) =>
      file.copyTo(
        path.join(
          this.target,
          file.source.pathRelativeToOrigin.replace(
            file.source.extension,
            ".html"
          )
        ),
        file.transformations.get("htmlContent")
      )
    );
  }
}
