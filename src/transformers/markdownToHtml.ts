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
import { FrontMatter } from "./fileTransformations";
import logPlugin from "../unified/log";
import { toHtml } from "hast-util-to-html";

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
      // It sounds like we may want to use rehype-raw and then rehype-sanitize
      // instead of allowDangerousHtml. We trust all the HTML I've authored, so
      // that safety angle is fine. It sounds like maybe rehype-raw lets plugins
      // continue to use the HTML embedded in a markdown document as an AST though.
      // we might have use for that in the future.
      .use(remarkRehype, {
        allowDangerousHtml: true,
        handlers: {
          // code(state, node) {
          //   // Convert the node back to raw HTML (including children)
          //   const result = {
          //     type: "html",
          //     value: toHtml(node),
          //   };
          //   // Keep positional info (optional but useful for source maps)
          //   state.patch(node, result);
          //   return result;
          //   // return h(node, "code", { className: "my-code" }, node.value);
          // },
        },
      })
      .use(rehypeStringify, {
        allowDangerousHtml: true,
      });
  }

  filter(file: SsgFile): boolean {
    return file.source.extension === ".md";
  }

  async transform(files: SsgFile[]): Promise<void> {
    const promises = files.map(async (file) => {
      const contents = await file.source.read();
      const parsed = await this.processor.process(contents);
      file.transformations.htmlContent = parsed.toString();
      file.transformations.matter = parsed.data.matter as FrontMatter;
    });

    await Promise.all(promises);
  }
}
