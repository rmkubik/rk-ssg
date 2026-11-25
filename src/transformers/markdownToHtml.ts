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
import { Eta } from "eta";
import { fromHtml } from "hast-util-from-html";
import type { Handlers, State } from "mdast-util-to-hast";
import fs from "fs/promises";
import path from "path";

export class MarkdownToHtml extends Transformer {
  private eta: Eta;

  constructor() {
    super();

    this.eta = new Eta();
  }

  createProcessor(handlers: Handlers) {
    return (
      unified()
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
            ...handlers,
          },
        })
        .use(rehypeStringify, {
          allowDangerousHtml: true,
        })
    );
  }

  private async parseComponentHandler(contents: string) {
    /**
     * Handler node types come from this list:
     * https://github.com/syntax-tree/mdast#nodes
     *
     * We have to just type it as "any" for now
     */
    return (state: State, node: any, parent: Mdast.Parents | undefined) => {
      const parsed = this.eta.renderString(contents, {
        state,
        node,
        parent,
      });
      return fromHtml(parsed, { fragment: true }).children;
    };
  }

  filter(file: SsgFile): boolean {
    return file.source.extension === ".md";
  }

  async transform(files: SsgFile[]): Promise<void> {
    const markdownFiles = files.filter(
      (file) => file.source.extension === ".md",
    );

    /**
     * TODO:
     * We're rebuilding the processor and the component
     * handlers for every file we render, this sounds
     * very inefficient.
     *
     * Maybe it is fine for now. We might need to optimize
     * in the future though.
     */
    const promises = markdownFiles.map(async (file) => {
      let componentHandlers: Handlers = {};
      if (file.transformations.componentHandlerDir) {
        const componentHandlerFiles = await fs.readdir(
          file.transformations.componentHandlerDir,
        );
        const componentHandlerEntryPromises = componentHandlerFiles.map(
          async (handler) => {
            const contents = await fs.readFile(
              path.join(file.transformations.componentHandlerDir!, handler),
              "utf8",
            );
            const parsed = await this.parseComponentHandler(contents);
            return [path.basename(handler, ".eta"), parsed] as const;
          },
        );
        const componentHandlerEntries = await Promise.all(
          componentHandlerEntryPromises,
        );
        componentHandlers = Object.fromEntries(componentHandlerEntries);
      }
      const contents = await file.source.read();
      const parsed =
        await this.createProcessor(componentHandlers).process(contents);
      file.transformations.htmlContent = parsed.toString();
      file.transformations.matter = parsed.data.matter as FrontMatter;
    });

    await Promise.all(promises);
  }
}
