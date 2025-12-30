import { Eta } from "eta";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import { PipelineContext } from "../pipeline/pipelineContext";
import { loadEtaViews } from "../templating/loadEtaViews";

export class ProcessHtmlContentAsEtaTemplate extends Transformer {
  private eta: Eta;

  constructor() {
    super();
    /**
     * We are using {{ and }} instead of Eta's default <% and %> because
     * the < character is escaped by our rehype markdown parsing. That character
     * is invalid HTML when it is in the text content of many nodes.
     *
     * To avoid this, we use the {{ which is not a relevant set of characters
     * for an HTML parser.
     *
     * TODO:
     * I _could_ make this invisible by leaving the old Eta tags in my source
     * markdown files and replacing them with these tags before I run
     * rehype-stringify on the files...
     */
    this.eta = new Eta({ tags: ["{{", "}}"] });
  }

  filter(file: SsgFile): boolean {
    return !!file.transformations.htmlContent;
  }

  async transform(files: SsgFile[], context: PipelineContext): Promise<void> {
    await loadEtaViews(this.eta, context.allEtaViews);

    const promises = files.map(async (file) => {
      /**
       * TODO:
       * This should be an impossible situation due to the filter.
       */
      if (!file.transformations.htmlContent) {
        console.error(
          `This should be an impossible situation due to the filter. ${file.source.absolutePath}`
        );
        return;
      }

      /**
       * This needs to be synced to the other eta transformers, in particular
       * the passed in variables.
       */
      const parsed = await this.eta.renderStringAsync(
        file.transformations.htmlContent,
        {
          matter: file.transformations.matter ?? {},
          readingTime: file.transformations.readingTime ?? {},
          context,
        }
      );
      file.transformations.htmlContent = parsed.toString();
    });

    await Promise.all(promises);
  }
}
