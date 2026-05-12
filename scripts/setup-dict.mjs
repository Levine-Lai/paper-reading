import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const outDir = path.resolve("public/dict");
const markerFiles = "abcdefghijklmnopqrstuvwxyz".split("").map((letter) => path.join(outDir, `${letter}.json`));
const existingChunks = markerFiles.filter((file) => fs.existsSync(file));

if (existingChunks.length) {
  console.log(`Dictionary already installed: ${existingChunks.length} chunk(s) found in public/dict.`);
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });

const sourcePath = path.resolve("node_modules/ecdict/data/dict.json");
if (!fs.existsSync(sourcePath)) {
  console.error("Cannot find ecdict data. Run npm.cmd install first, then npm.cmd run setup:dict.");
  process.exit(1);
}

console.log("Building optional dictionary chunks from ecdict...");
const result = spawnSync(process.execPath, [path.resolve("scripts/build-web-dict.mjs")], {
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

const builtChunks = markerFiles.filter((file) => fs.existsSync(file));
console.log(`Installed ${builtChunks.length} dictionary chunk(s) in public/dict.`);
