import { subcommands, run } from "cmd-ts";
import { build } from "./build";
import { serve } from "./serve";

const app = subcommands({
  name: "app",
  cmds: { build, serve },
});

export const runApplication = (args: typeof process.argv) => run(app, args);
