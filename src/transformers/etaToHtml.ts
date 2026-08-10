import { Eta } from "eta";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import { PipelineContext } from "../pipeline/pipelineContext";
import { loadEtaViews } from "../templating/loadEtaViews";

export class EtaToHtml extends Transformer {
  private eta: Eta;

  constructor() {
    super();
    /**
     * TODO:
     * We may want to coordinate settings between this Eta instance
     * and the one in processHtmlContentAsEtaTemplate.
     */
    this.eta = new Eta();
  }

  filter(file: SsgFile): boolean {
    return (
      file.source.extension === ".eta" &&
      /**
       * It is unfortunate that we are sort of hard coupling this transformer
       * to the previous one that identifies templates. I think ideally, you'd
       * maybe configure this Transformer to be able to ignore whatever you want.
       *
       * This is done so that etaTemplates themselves are not parsed by themselves.
       */
      !file.transformations.isEtaTemplate
    );
  }

  async transform(files: SsgFile[], context: PipelineContext): Promise<void> {
    await loadEtaViews(this.eta, context.allEtaViews);

    const promises = files.map(async (file) => {
      const contents = await file.source.read();

      /**
       * This needs to be synced to the other eta transformers, in particular
       * the passed in variables.
       *
       * TODO:
       * I need to keep manually adding in new "file context" values whenever
       * I add new transformations. I shouldn't need to remember to do this
       * step manually. I should have a way, probably when I'm making the new
       * pipeline step to flag it as "Expose This On File Context" so that
       * templates can reference the data.
       */
      const parsed = await this.eta.renderStringAsync(contents, {
        matter: file.transformations.matter ?? {},
        htmlContent: file.transformations.htmlContent,
        readingTime: file.transformations.readingTime ?? {},
        slug: file.slug,
        previewText: file.transformations.previewText,
        context,
      });
      file.transformations.htmlContent = parsed.toString();
    });

    await Promise.all(promises);
  }
}
