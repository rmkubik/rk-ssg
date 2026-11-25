import { Directory, File } from "cmd-ts/batteries/fs";
import { command, option, optional, positional, string } from "cmd-ts";
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
    configPath: option({
      // TODO: Not sure if this will work since I'm resolving relative path in my loadConfig function
      type: optional(File),
      long: "config",
    }),
  },
  handler: async ({ targetDirectory, outDir, configPath }) => {
    const pipeline = createBuildPipeline(targetDirectory, outDir, configPath);

    await pipeline.run();
  },
});
