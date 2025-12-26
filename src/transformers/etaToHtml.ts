import { Eta } from "eta";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";

export class EtaToHtml extends Transformer {
  private eta: Eta;

  constructor() {
    super();
    this.eta = new Eta();
  }

  filter(file: SsgFile): boolean {
    return file.source.extension === ".eta";
  }

  // - pull _template.eta from same directory as this file
  // - add htmlContent to render
  // - add matter to render

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      const contents = await file.source.read();
      const parsed = await this.eta.renderStringAsync(contents, {
        matter: file.transformations.matter ?? {},
        htmlContent: file.transformations.htmlContent,
      });
      file.transformations.htmlContent = parsed.toString();
    });

    await Promise.all(promises);
  }
}
