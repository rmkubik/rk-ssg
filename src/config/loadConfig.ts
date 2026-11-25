import { z } from "zod";
import { pathToFileURL } from "node:url";

export const ConfigSchema = z.object({
  devServer: z
    .object({
      url: z.string().default("http://localhost:3000"),
    })
    .prefault({}),
});

export type ConfigInput = z.input<typeof ConfigSchema>;
export type Config = z.output<typeof ConfigSchema>;

export const CONFIG_FILE_NAME = "rk-ssg.config.mts";

export async function loadConfig(file = CONFIG_FILE_NAME): Promise<Config> {
  const url = pathToFileURL(file).href;
  const module = await import(url);
  return ConfigSchema.parse(module.default ?? module);
}
