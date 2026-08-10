import { Processor, unified } from "unified";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import rehypeParse from "rehype-parse";
import * as Hast from "hast";
import { toText } from "hast-util-to-text";
import remarkParse from "remark-parse";
import { PipelineContext } from "../pipeline/pipelineContext";

export class HtmlTextPreview extends Transformer {
  private processor: Processor<
    Hast.Root,
    undefined,
    undefined,
    undefined,
    undefined
  >;

  constructor() {
    super();

    this.processor = unified()
      .use(remarkParse)
      .use(rehypeParse, { fragment: true });
  }

  /**
   * TODO:
   * This is inefficient and wont' be accurate if templates change
   * post content significantly.
   *
   * But we should switch to just fully parsing the html/markdown of
   * a source file and then running it through the process ourselves.
   *
   * This "solves" the catch22 of needing to parse the htmlContent
   * before getting preview text and needing the preview text to
   * be available for the template.
   *
   * There are some ideas online i want to look into about complicating
   * our render process to allow for intermediate stages or something,
   * but I'm not going to do that now.
   */
  filter(file: SsgFile): boolean {
    return file.isHtml || file.source.extension === ".md";
  }

  async transform(files: SsgFile[], context: PipelineContext): Promise<void> {
    const promises = files.map(async (file) => {
      const transformedFile = await context.transformAbsolutePath(
        file.source.absolutePath,
        file.source.directory,
        // Prevent infinitely recursing through item preview transformations
        (item) => !(item instanceof HtmlTextPreview),
      );
      const parsed = await this.processor.parse(
        transformedFile.transformations.htmlContent,
      );
      const text = toText(parsed);
      file.transformations.previewText = text.slice(0, 250);
    });

    await Promise.all(promises);
  }
}
