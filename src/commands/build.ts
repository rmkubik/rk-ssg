import { Directory } from "cmd-ts/batteries/fs";
import { command, positional } from "cmd-ts";
import { crawlDirectory } from "../sourcers/directoryCrawler";
import { WriteFiles } from "../emitters/writeFiles";
import { MarkdownToHtml } from "../transformers/markdownToHtml";
import { WriteHtmlFiles } from "../emitters/writeHtmlFiles";

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
    const filesToTransform = files.filter((file) =>
      markdownToHtml.filter(file)
    );
    await markdownToHtml.transform(filesToTransform);

    // TODO:
    // This **/*.* glob seems to work as a default "match everything",
    // but I should probably do some more looking into that.
    const writeFiles = new WriteFiles("**/*.*", "./dist");
    const filesToWrite = files.filter((file) => writeFiles.filter(file));
    // writeFiles.emit(filesToWrite);

    const htmlFileWriter = new WriteHtmlFiles("./dist");
    const htmlFilesToWrite = files.filter((file) =>
      htmlFileWriter.filter(file)
    );
    htmlFileWriter.emit(htmlFilesToWrite);
  },
});
