import { Directory } from "cmd-ts/batteries/fs";
import { command, positional } from "cmd-ts";
import { createBuildPipeline } from "../pipeline/createBuildPipeline";

export const build = command({
  name: "build",
  args: {
    targetDirectory: positional({
      displayName: "targetDirectory",
      type: Directory,
    }),
  },
  handler: async ({ targetDirectory }) => {
    const pipeline = createBuildPipeline(targetDirectory);

    await pipeline.run();
  },
});
