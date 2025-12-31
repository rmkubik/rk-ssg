import { Directory } from "cmd-ts/batteries/fs";
import { command, option, positional, string } from "cmd-ts";
import { createBuildPipeline } from "../pipeline/createBuildPipeline";

export const build = command({
  name: "build",
  args: {
    targetDirectory: positional({
      displayName: "targetDirectory",
      type: Directory,
    }),
    outDir: option({
      type: string,
      long: "outdir",
      short: "o",
    }),
  },
  handler: async ({ targetDirectory, outDir }) => {
    const pipeline = createBuildPipeline(targetDirectory, outDir);

    await pipeline.run();
  },
});
