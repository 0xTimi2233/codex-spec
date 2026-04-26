import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const root = path.resolve(new URL("..", import.meta.url).pathname);

export function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function readText(...parts) {
  return fs.readFileSync(path.join(...parts), "utf8");
}

function cliPath(kind) {
  return path.join(root, kind === "dist" ? "dist" : "src", "cli.js");
}

function hookPath(kind, name) {
  return path.join(root, kind === "dist" ? "dist" : "src", "hooks", `${name}.js`);
}

export function runCli(kind, args) {
  const res = spawnSync(process.execPath, [cliPath(kind), ...args], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status || 1);
  }
  return res.stdout;
}

export function runCliFail(kind, args) {
  const res = spawnSync(process.execPath, [cliPath(kind), ...args], { encoding: "utf8" });
  if (res.status === 0) throw new Error(`Expected command to fail: ${args.join(" ")}`);
  return `${res.stdout}${res.stderr}`;
}

export function runHook(name, cwd, payload, { kind = "src" } = {}) {
  const res = spawnSync(process.execPath, [hookPath(kind, name)], {
    cwd,
    input: JSON.stringify(payload),
    encoding: "utf8"
  });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status || 1);
  }
  return JSON.parse(res.stdout);
}
