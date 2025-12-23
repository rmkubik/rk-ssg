import { subcommands, run } from "cmd-ts";
import { build } from "./build";

const app = subcommands({
  name: "app",
  cmds: { build },
});

export const runApplication = (args: typeof process.argv) => run(app, args);
