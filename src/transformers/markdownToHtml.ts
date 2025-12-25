import { Processor, unified } from "unified";
import { SsgFile } from "../files/ssgFile";
import { Transformer } from "./transformer";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import * as Mdast from "mdast";
import * as Hast from "hast";
import remarkFrontmatter from "remark-frontmatter";
import parseMarkdownYamlFrontmatterPlugin from "../unified/parseMarkdownYamlFrontmatterPlugin";

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
      // I think this plugin literally just grabs the frontmatter fences and
      // doesn't actually parse any data at all out of it? I am not sure why
      // you can/need to specify yaml/toml at all for this case?
      .use(remarkFrontmatter, ["yaml", "toml"])
      .use(parseMarkdownYamlFrontmatterPlugin)
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
      console.log({ parsed }, parsed.data.matter);
      file.transformations.htmlContent = parsed.toString();
    });

    await Promise.all(promises);
  }
}
