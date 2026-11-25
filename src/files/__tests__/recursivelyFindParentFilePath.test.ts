import path from "node:path";
import { recursivelyFindParentFilePath } from "../recursivelyFindParentFilePath";
import { describe, it, afterEach, beforeEach, expect } from "vitest";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";

describe("recursivelyFindParentFilePath", () => {
  let rootPath: string;

  beforeEach(async () => {
    rootPath = await createTempDir();
  });

  afterEach(async () => {
    await cleanTempDir(rootPath);
  });

  it("reads same level file", async () => {
    await writeTree(rootPath, {
      ["target.txt"]: "",
    });

    const filePath = await recursivelyFindParentFilePath(
      "target.txt",
      rootPath,
      rootPath,
    );

    expect(filePath).toBe(path.join(rootPath, "target.txt"));
  });

  it("returns undefined if no target file", async () => {
    await writeTree(rootPath, {});

    const filePath = await recursivelyFindParentFilePath(
      "target.txt",
      rootPath,
      rootPath,
    );

    expect(filePath).toBe(undefined);
  });

  it("finds a parent config", async () => {
    await writeTree(rootPath, {
      a: {
        b: {},
        "target.txt": "",
      },
    });

    const filePath = await recursivelyFindParentFilePath(
      "target.txt",
      path.join(rootPath, "a", "b"),
      rootPath,
    );

    expect(filePath).toBe(path.join(rootPath, "a", "target.txt"));
  });

  it("ignores parent's parent config", async () => {
    await writeTree(rootPath, {
      a: {
        b: {
          c: {},
          "target.txt": "",
        },
      },
    });

    const filePath = await recursivelyFindParentFilePath(
      "target.txt",
      path.join(rootPath, "a", "b", "c"),
      rootPath,
    );

    expect(filePath).toBe(path.join(rootPath, "a", "b", "target.txt"));
  });

  it("ignores config outside of boundary", async () => {
    await writeTree(rootPath, {
      a: {
        b: {
          c: {},
        },
        "target.txt": "",
      },
    });

    const filePath = await recursivelyFindParentFilePath(
      "target.txt",
      path.join(rootPath, "a", "b", "c"),
      path.join(rootPath, "a", "b"),
    );

    expect(filePath).toBe(undefined);
  });

  it("resolves if startDir not within boundaryDir", async () => {
    const result = await recursivelyFindParentFilePath(
      "target.txt",
      path.join(rootPath, ".."),
      rootPath,
    );
    expect(result).toBe(undefined);
    // Lower timeout since we're expecting an inf loop in the fail case
  }, 2000);

  it("can find a directory", async () => {
    await writeTree(rootPath, {
      a: {
        b: {
          c: {},
        },
        targetDir: {},
      },
    });

    const filePath = await recursivelyFindParentFilePath(
      "targetDir",
      path.join(rootPath, "a", "b", "c"),
      rootPath,
    );

    expect(filePath).toBe(path.join(rootPath, "a", "targetDir"));
  });
});

async function createTempDir() {
  const root = await fs.mkdtemp(path.join(tmpdir(), "rk-ssg-"));

  return root;
}

async function cleanTempDir(path: string) {
  await fs.rm(path, { recursive: true, force: true });
}

type Tree = { [name: string]: string | Tree };

async function writeTree(root: string, tree: Tree) {
  for (const [name, value] of Object.entries(tree)) {
    const filePath = path.join(root, name);

    if (typeof value === "string") {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, value);
    } else {
      await fs.mkdir(filePath, { recursive: true });
      await writeTree(filePath, value ?? {});
    }
  }
}
