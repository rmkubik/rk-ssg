import { Directory } from "cmd-ts/batteries/fs";
import { command, positional } from "cmd-ts";
import { DirectoryCrawler } from "../sourcers/directoryCrawler";
import { WriteFiles } from "../emitters/writeFiles";
import { MarkdownToHtml } from "../transformers/markdownToHtml";
import { WriteHtmlContentFiles } from "../emitters/writeHtmlContentFiles";
import { EtaToHtml } from "../transformers/etaToHtml";
import { FindEtaTemplate } from "../transformers/findEtaTemplate";
import { EtaTemplatedToHtml } from "../transformers/etaTemplatedToHtml";
import { Pipeline } from "../pipeline/pipeline";
import { UseDirectoryAsNameForIndex } from "../transformers/useDirectoryAsNameForIndex";

export const build = command({
  name: "build",
  args: {
    targetDirectory: positional({
      displayName: "targetDirectory",
      type: Directory,
    }),
  },
  handler: async ({ targetDirectory }) => {
    const pipeline = new Pipeline()
      .source(new DirectoryCrawler({ directory: targetDirectory }))
      // .transform(new UseDirectoryAsNameForIndex())
      .transform(new MarkdownToHtml())
      .transform(new EtaToHtml())
      .transform(new FindEtaTemplate())
      .transform(new EtaTemplatedToHtml())
      .emit(new WriteFiles("**/*.html", "./dist"))
      .emit(new WriteHtmlContentFiles("./dist"));

    await pipeline.run();
  },
});
