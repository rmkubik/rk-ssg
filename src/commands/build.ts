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
import { ProcessHtmlContentAsEtaTemplate } from "../transformers/processHtmlContentAsEtaTemplate";
import { PrettifyHtmlContent } from "../transformers/prettifyHtmlContent";
import { RemapPathPublicFiles } from "../transformers/remapPathPublicFiles";

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
      // I'm not fully sure if it is more appropriate to just leave /post/index.html
      // files like this or collapse them into /post.html... I guess it will depend on
      // whatever server I'm hosting the files on?
      // .transform(new UseDirectoryAsNameForIndex())
      .transform(new MarkdownToHtml())
      .transform(new ProcessHtmlContentAsEtaTemplate())
      .transform(new EtaToHtml())
      .transform(new FindEtaTemplate())
      .transform(new EtaTemplatedToHtml())
      .transform(new PrettifyHtmlContent())
      .transform(new RemapPathPublicFiles())
      .emit(new WriteFiles("**/*.html", "./dist"))
      .emit(new WriteFiles("public/**/*.*", "./dist"))
      .emit(new WriteHtmlContentFiles("./dist"));

    await pipeline.run();
  },
});
