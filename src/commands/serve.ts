import { Directory } from "cmd-ts/batteries/fs";
import { command, positional } from "cmd-ts";
import { createBuildPipeline } from "../pipeline/createBuildPipeline";
import express from "express";
import chokidar from "chokidar";

function createApp() {
  const app = express();
  const port = 3000;

  // app.get("/", (req, res) => {
  //   res.send("Hello World!");
  // });

  /**
   * TODO:
   * Can I make /blog/post2 serve /blog/post2.html file?
   * It doesn't get served if I omit the .html file.
   */
  app.use(
    express.static("dist", {
      extensions: ["html", "htm"],
    })
  );

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  return app;
}

function watch(dir: string, handle: Function) {
  chokidar.watch(dir).on("all", (event, path) => {
    handle();
  });
}

export const serve = command({
  name: "serve",
  args: {
    targetDirectory: positional({
      displayName: "targetDirectory",
      type: Directory,
    }),
  },
  handler: async ({ targetDirectory }) => {
    createApp();

    watch(targetDirectory, async () => {
      const pipeline = createBuildPipeline(targetDirectory);

      await pipeline.run();
    });
  },
});
