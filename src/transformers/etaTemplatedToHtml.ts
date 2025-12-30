import { Eta } from "eta";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import { PipelineContext } from "../pipeline/pipelineContext";
import { loadEtaViews } from "../templating/loadEtaViews";

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

  async transform(files: SsgFile[], context: PipelineContext): Promise<void> {
    /**
     * TODO:
     * This needs to be called before eta renders can be called. It seems pretty wasteful
     * that we're doing this in many different transformers.
     *
     * If we changed this transformer to operate per file this would be really wasteful. I
     * guess we could just easily move it to the constructor.
     */
    await loadEtaViews(this.eta, context.allEtaViews);

    const promises = files.map(async (file) => {
      if (!file.transformations.etaTemplate) {
        console.error(
          "A file has been filtered into etaTemplatedToHtml transformation. These should have already have been filtered."
        );
        return;
      }

      /**
       * This needs to be synced to the other eta transformers, in particular
       * the passed in variables.
       */
      const parsed = await this.eta.renderStringAsync(
        file.transformations.etaTemplate,
        {
          matter: file.transformations.matter ?? {},
          htmlContent: file.transformations.htmlContent,
          readingTime: file.transformations.readingTime ?? {},
          context,
        }
      );
      file.transformations.htmlContent = parsed.toString();
    });

    await Promise.all(promises);
  }
}
