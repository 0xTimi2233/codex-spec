import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "codex-spec-dist-"));
function run(args) {
  const res = spawnSync(process.execPath, [path.join(root, "dist", "cli.js"), ...args], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status || 1);
  }
  return res.stdout;
}
run(["init", "--lang", "en", "--target", tmp]);
run(["health", "--target", tmp]);
run(["status", "--target", tmp]);
console.log(`dist smoke OK: ${tmp}`);
