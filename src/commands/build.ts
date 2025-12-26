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
      .transform(new MarkdownToHtml())
      .transform(new EtaToHtml())
      .transform(new FindEtaTemplate())
      .transform(new EtaTemplatedToHtml())
      .emit(new WriteFiles("**/*.html", "./dist"))
      .emit(new WriteHtmlContentFiles("./dist"));

    await pipeline.run();

    // const files = await crawlDirectory({ directory: targetDirectory });

    // const markdownToHtml = new MarkdownToHtml();
    // const markdownFilesToTransform = files.filter((file) =>
    //   markdownToHtml.filter(file)
    // );
    // await markdownToHtml.transform(markdownFilesToTransform);

    // const etaToHtml = new EtaToHtml();
    // const etaFilesToTransform = files.filter((file) => etaToHtml.filter(file));
    // await etaToHtml.transform(etaFilesToTransform);

    // const findEtaTemplates = new FindEtaTemplate();
    // const filesThatCouldHaveTemplates = files.filter((file) =>
    //   findEtaTemplates.filter(file)
    // );
    // await findEtaTemplates.transform(filesThatCouldHaveTemplates);

    // const etaTemplatedToHtml = new EtaTemplatedToHtml();
    // const filesWithTemplates = files.filter((file) =>
    //   etaTemplatedToHtml.filter(file)
    // );
    // await etaTemplatedToHtml.transform(filesWithTemplates);

    // TODO:
    // This **/*.* glob seems to work as a default "match everything",
    // but I should probably do some more looking into that.
    //
    // This should also probably not work in the long run, we will probably
    // want to also transform .html files and will need to figure out how
    // to be smart about that too.
    // const writeHtmlFiles = new WriteFiles("**/*.html", "./dist");
    // const filesToWrite = files.filter((file) => writeHtmlFiles.filter(file));
    // await writeHtmlFiles.emit(filesToWrite);

    // const htmlContentFileWriter = new WriteHtmlContentFiles("./dist");
    // const htmlFilesToWrite = files.filter((file) =>
    //   htmlContentFileWriter.filter(file)
    // );
    // await htmlContentFileWriter.emit(htmlFilesToWrite);
  },
});
