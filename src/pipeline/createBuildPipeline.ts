import { Directory } from "cmd-ts/batteries/fs";
import { command, positional } from "cmd-ts";
import { DirectoryCrawler } from "../sourcers/directoryCrawler";
import { WriteFiles } from "../emitters/writeFiles";
import { MarkdownToHtml } from "../transformers/markdownToHtml";
import { WriteHtmlContentFiles } from "../emitters/writeHtmlContentFiles";
import { EtaToHtml } from "../transformers/etaToHtml";
import { FindEtaTemplate } from "../transformers/findEtaTemplate";
import { EtaTemplatedToHtml } from "../transformers/etaTemplatedToHtml";
import { Pipeline } from "./pipeline";
import { UseDirectoryAsNameForIndex } from "../transformers/useDirectoryAsNameForIndex";
import { ProcessHtmlContentAsEtaTemplate } from "../transformers/processHtmlContentAsEtaTemplate";
import { PrettifyHtmlContent } from "../transformers/prettifyHtmlContent";
import { RemapPathPublicFiles } from "../transformers/remapPathPublicFiles";
import { IdentifyEtaTemplates } from "../transformers/identifyEtaTemplates";
import { DoNotEmitMatchingFiles } from "../transformers/DoNotEmitMatchingFiles";
import { IdentifyEtaViews } from "../transformers/identifyEtaViews";
import { EmitRssFeed } from "../emitters/emitRssFeed";
import { URL } from "url";
import { ComputeReadingTime } from "../transformers/computeReadingTime";

export function createBuildPipeline(targetDirectory: string) {
  return (
    /**
     * TODO:
     * This port and dev server URL needs to be manually synced with the
     * dev server.
     *
     * This would be more useful if it were configurable by an end user.
     */
    new Pipeline(new URL("http://localhost:3000"))
      .source(new DirectoryCrawler({ directory: targetDirectory }))
      // I'm not fully sure if it is more appropriate to just leave /post/index.html
      // files like this or collapse them into /post.html... I guess it will depend on
      // whatever server I'm hosting the files on?
      // .transform(new UseDirectoryAsNameForIndex())
      // --- "pre transform" ---
      // Change the output path of public files to not have /public
      .transform(new RemapPathPublicFiles())
      // Track which files are _template.eta
      .transform(new IdentifyEtaTemplates())
      // Find _template.eta files for each file that might use a template
      .transform(new FindEtaTemplate())
      /**
       * Track which files are eta view files.
       *
       * TODO:
       * This should be configurable.
       */
      .transform(new IdentifyEtaViews("views/**/*.*"))
      // Mark eta view files as not being emitted
      .transform(new DoNotEmitMatchingFiles("views/**/*.*"))
      // Add reading time info to file transformation
      .transform(new ComputeReadingTime())
      // --- "transform" ---
      // Convert markdown files to htmlContent
      .transform(new MarkdownToHtml())
      // Process htmlContent as an eta template and overwrite htmlContent
      .transform(new ProcessHtmlContentAsEtaTemplate())
      // Convert .eta files to htmlContent
      .transform(new EtaToHtml())
      // Convert files with .etaTemplate to htmlContent
      .transform(new EtaTemplatedToHtml())
      // --- "post transform" ---
      .transform(new PrettifyHtmlContent())
      // --- emit ---
      .emit(new WriteFiles("**/*.html", "./dist"))
      .emit(new WriteFiles("public/**/*.*", "./dist"))
      .emit(new WriteFiles(["**/*.png", "**/*.jpg"], "./dist"))
      .emit(new WriteHtmlContentFiles("./dist"))
      .emit(new EmitRssFeed("/blog/", "./dist"))
  );
}
