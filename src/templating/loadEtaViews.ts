import { Eta } from "eta";
import { SsgFile } from "../files/ssgFile";

export async function loadEtaViews(eta: Eta, files: SsgFile[]): Promise<void> {
  const promises = files.map(async (file) => {
    const contents = await file.source.read();
    /**
     * TODO:
     * I'm not fully sure the difference between a sync and an async template.
     * I know I'm rendering them as async in my current transformers. So that
     * seems to require I mark my templates as async here.
     */
    eta.loadTemplate("@" + file.slug, contents, { async: true });
  });

  await Promise.all(promises);
}
