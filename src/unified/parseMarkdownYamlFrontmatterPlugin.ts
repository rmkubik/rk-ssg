import { Node } from "unist";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

/**
 * Parse YAML frontmatter and expose it at `file.data.matter`.
 */
export default function parseMarkdownYamlFrontmatterPlugin() {
  return function (tree: Node, file: VFile) {
    matter(file);
  };
}
