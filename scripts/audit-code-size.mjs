import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const roots = ["."];
const extensions = new Set([".ts", ".tsx", ".mjs", ".css"]);
const offenders = [];
const ignoredDirectories = new Set([".git", ".next", ".superpowers", ".wrangler", "dist", "node_modules"]);

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) await inspect(path);
    else if (extensions.has(entry.name.slice(entry.name.lastIndexOf(".")))) {
      const lines = (await readFile(path, "utf8")).split("\n").length;
      if (lines >= 500) offenders.push(`${path}: ${lines}`);
    }
  }
}

for (const root of roots) await inspect(root);
assert.deepEqual(offenders, [], `500줄 이상 코드 파일: ${offenders.join(", ")}`);
console.log("code-size audit: all checked code files are under 500 lines");
