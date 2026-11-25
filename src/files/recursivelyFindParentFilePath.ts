import fs from "fs/promises";
import path from "path";

export async function recursivelyFindParentFilePath(
  targetFile: string,
  startingDir: string,
  boundaryDir: string,
): Promise<string | undefined> {
  console.log(startingDir, boundaryDir);
  // look for a file named targetFile
  // start at the startingPath file
  // recurse upward until you find the path or hit the boundary path
  const dirContents = await fs.readdir(startingDir);
  if (dirContents.includes(targetFile)) {
    return path.join(startingDir, targetFile);
  }

  if (startingDir === boundaryDir || !isWithin(boundaryDir, startingDir))
    return undefined;

  const parentDir = path.dirname(startingDir);
  return recursivelyFindParentFilePath(targetFile, parentDir, boundaryDir);
}

function isWithin(parent: string, child: string): boolean {
  const rel = path.relative(path.resolve(parent), path.resolve(child));

  return (
    rel !== "" && // not the same dir
    rel !== ".." && // not the parent itself
    !rel.startsWith(`..${path.sep}`) && // not a sibling/ancestor
    !path.isAbsolute(rel)
  );
}
