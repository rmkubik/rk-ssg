import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import { prettify } from "htmlfy";

export class PrettifyHtmlContent extends Transformer {
  filter(file: SsgFile): boolean {
    return !!file.transformations.htmlContent;
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      // TODO:
      // This shouldn't happen because of our filter above
      if (!file.transformations.htmlContent) return;

      file.transformations.htmlContent = prettify(
        file.transformations.htmlContent
      );
    });

    await Promise.all(promises);
  }
}
