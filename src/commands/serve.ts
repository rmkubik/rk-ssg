import { Directory } from "cmd-ts/batteries/fs";
import { command, option, positional, string } from "cmd-ts";
import { createBuildPipeline } from "../pipeline/createBuildPipeline";
import express, { NextFunction, Request, Response } from "express";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import path from "path";
import fsExtra from "fs-extra";
import fs from "fs/promises";
import { EventName } from "chokidar/handler.js";

const port = 3000;

/**
 * Inject a web socket connection into all HTML files that we serve
 * from this middleware.
 *
 * The web socket will refresh the browser when our dev server detects
 * a change to a file it is watching.
 */
function injectDevServerWebSocket(targetDirectory: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    // Only handle get requests that are looking for HTML
    // documents
    if (req.method !== "GET") return next();
    if (!req.accepts("html")) return next();

    let urlPath = decodeURIComponent(req.path);
    let candidates = [];

    if (urlPath.endsWith(".html")) {
      /**
       * TODO:
       * Technically this is a URL, not a filepath. On a windows
       * computer, the / wouldn't resolve correctly. IDC since
       * I'm working on MacOS and Linux.
       */
      // /file/name.html → /file/name.html
      candidates.push(urlPath);
    } else {
      candidates.push(
        // /file/name2 → /file/name2.html
        urlPath + ".html",
        // /file/name → /file/name/index.html
        path.join(urlPath, "index.html"),
      );
    }

    // try resolving files in order
    for (const candidate of candidates) {
      const filePath = path.join(targetDirectory, candidate);

      if (await fsExtra.pathExists(filePath)) {
        let body = await fs.readFile(filePath, "utf8");

        /**
         * TODO:
         * This is pretty naive and requires that a <head></head> element
         * exists in the HTML document we are serving.
         *
         * I'm not sure if it is prohibitive to parse the entire HTML document
         * here or not, but we could do that and logically check for and then
         * add a <head> if it is missing.
         */
        body = body.replace(
          "</head>",
          `<script>
            const ws = new WebSocket('ws://localhost:${port}');
            ws.onmessage = (event) => {
              if (event.data === "refresh") {
                console.log("Received refresh request from dev server. Reloading page.")
                window.location.reload();
              }
            };
          </script>
          </head>`,
        );

        res.setHeader("Content-Type", "text/html");
        return res.send(body);
      }
    }

    next();
  };
}

function broadcast(wss: WebSocketServer, message: string) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function createApp(outDir: string) {
  const app = express();

  /**
   * We need to serve .html files ourselves so that we can inject
   * our web socket script.
   */
  app.use(injectDevServerWebSocket(outDir));

  app.use(
    // Serve static assets from the dist folder
    express.static(outDir, {
      // Leaving this here for posterity, but we're now serving HTML
      // files above with our custom middleware.
      //
      // Allow files with these extensions to be served without
      // specifying the extension
      extensions: ["html"],
    }),
  );

  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws) {
    // console.log("New client connected");

    ws.on("message", function message(data) {
      const messageText = data.toString();
      // console.log("Received:", messageText);
      ws.send(`Echo: ${messageText}`);
    });

    ws.on("close", function close() {
      // console.log("Client disconnected");
    });
  });

  server.listen(port, () => {
    console.log(`Dev server running on http://localhost:${port}`);
  });

  return { app, wss };
}

function watch(dir: string, handle: Function) {
  let isReady = false;

  chokidar
    .watch(dir)
    /**
     * TODO:
     * We should pass only the changed paths (maybe) in the future to the
     * handler so that we can speed up rebuilds.
     *
     * The trick here is that we don't know what other files (like a blog index)
     * might need to be rebuilt based on another path...
     *
     * It may be that we need something more specialized along the lines of:
     * - Always rebuild whatever page you're looking at fresh on every refresh
     * - Some parts of the build pipeline get redone on watch, maybe pre-transforms
     *   steps for identification
     * - But then you only need to run transform and emit steps on affected files?
     */
    .on("all", (event, path) => {
      // We only want subsequent file changes to trigger our handler
      if (isReady) {
        handle(event, path);
      }
    })
    // ready fires after the initial directory scan completes
    .on("ready", () => (isReady = true));
}

export const serve = command({
  name: "serve",
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
    const { wss } = createApp(outDir);

    watch(targetDirectory, async (event: EventName, path: string) => {
      const pipeline = createBuildPipeline(targetDirectory, outDir);

      console.log("Running build pipeline");
      await pipeline.run();
      console.log("Finished running build pipeline");

      broadcast(wss, "refresh");
    });
  },
});
