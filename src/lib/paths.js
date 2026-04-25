import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function findPackageRoot(startFileUrlOrPath) {
  let start = typeof startFileUrlOrPath === "string" && startFileUrlOrPath.startsWith("file:")
    ? fileURLToPath(startFileUrlOrPath)
    : startFileUrlOrPath;
  let dir = fs.existsSync(start) && fs.statSync(start).isFile() ? path.dirname(start) : start;
  while (true) {
    const pkg = path.join(dir, "package.json");
    if (fs.existsSync(pkg)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`Cannot find package.json from ${start}`);
    dir = parent;
  }
}

export function resolveTarget(args) {
  return path.resolve(String(args.target || args.cwd || process.cwd()));
}

export function hookPaths(packageRoot) {
  const dist = path.join(packageRoot, "dist", "hooks");
  const src = path.join(packageRoot, "src", "hooks");
  const base = fs.existsSync(path.join(dist, "user-prompt-submit.js")) ? dist : src;
  return {
    userPromptSubmit: path.join(base, "user-prompt-submit.js"),
    preToolUse: path.join(base, "pre-tool-use.js"),
    postToolUse: path.join(base, "post-tool-use.js"),
    stop: path.join(base, "stop.js")
  };
}

export function tomlString(value) {
  return JSON.stringify(value);
}

export function commandForNodeScript(scriptPath) {
  return `node ${JSON.stringify(scriptPath)}`;
}

export function findProjectRoot(start = process.cwd()) {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, "agentflow")) && fs.existsSync(path.join(dir, ".agentflow"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
