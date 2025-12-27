import { Node } from "unist";
import { VFile } from "vfile";

export default function logPlugin() {
  return function (tree: Node, file: VFile) {
    console.log({ tree, file });
  };
}
