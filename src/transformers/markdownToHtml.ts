import { Processor, unified } from "unified";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import * as Mdast from "mdast";
import * as Hast from "hast";

export class MarkdownToHtml extends Transformer {
  private processor: Processor<
    Mdast.Root,
    Mdast.Root,
    Hast.Root,
    Hast.Root,
    string
  >;

  constructor() {
    super();

    this.processor = unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify);
  }

  filter(file: SsgFile): boolean {
    return file.source.extension === ".md";
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      const contents = await file.source.read();
      const parsed = await this.processor.process(contents);
      file.transformations.htmlContent = parsed.toString();
    });

    await Promise.all(promises);
  }
}
