import { Eta } from "eta";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";

export class EtaTemplatedToHtml extends Transformer {
  private eta: Eta;

  constructor() {
    super();
    this.eta = new Eta();
  }

  filter(file: SsgFile): boolean {
    return (
      !!file.transformations.etaTemplate && !!file.transformations.htmlContent
    );
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      if (!file.transformations.etaTemplate) {
        console.error(
          "A file has been filtered into etaTemplatedToHtml transformation. These should have already have been filtered."
        );
        return;
      }

      const parsed = await this.eta.renderStringAsync(
        file.transformations.etaTemplate,
        {
          matter: file.transformations.matter ?? {},
          htmlContent: file.transformations.htmlContent,
        }
      );
      file.transformations.htmlContent = parsed.toString();
    });

    await Promise.all(promises);
  }
}
