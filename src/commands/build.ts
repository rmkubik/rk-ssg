import { Directory } from "cmd-ts/batteries/fs";
import { command, positional } from "cmd-ts";
import { crawlDirectory } from "../sourcers/directoryCrawler";
import { WriteFiles } from "../emitters/writeFiles";
import { MarkdownToHtml } from "../transformers/markdownToHtml";
import { WriteHtmlContentFiles } from "../emitters/writeHtmlContentFiles";
import { EtaToHtml } from "../transformers/etaToHtml";

export const build = command({
  name: "build",
  args: {
    targetDirectory: positional({
      displayName: "targetDirectory",
      type: Directory,
    }),
  },
  handler: async ({ targetDirectory }) => {
    const files = await crawlDirectory({ directory: targetDirectory });

    const markdownToHtml = new MarkdownToHtml();
    const markdownFilesToTransform = files.filter((file) =>
      markdownToHtml.filter(file)
    );
    await markdownToHtml.transform(markdownFilesToTransform);

    const etaToHtml = new EtaToHtml();
    const etaFilesToTransform = files.filter((file) => etaToHtml.filter(file));
    await etaToHtml.transform(etaFilesToTransform);

    // TODO:
    // This **/*.* glob seems to work as a default "match everything",
    // but I should probably do some more looking into that.
    //
    // This should also probably not work in the long run, we will probably
    // want to also transform .html files and will need to figure out how
    // to be smart about that too.
    const writeHtmlFiles = new WriteFiles("**/*.html", "./dist");
    const filesToWrite = files.filter((file) => writeHtmlFiles.filter(file));
    writeHtmlFiles.emit(filesToWrite);

    const htmlFileWriter = new WriteHtmlContentFiles("./dist");
    const htmlFilesToWrite = files.filter((file) =>
      htmlFileWriter.filter(file)
    );
    htmlFileWriter.emit(htmlFilesToWrite);
  },
});
