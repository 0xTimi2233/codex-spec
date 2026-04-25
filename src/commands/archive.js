import fs from "node:fs";
import path from "node:path";
import { ensureDir, exists } from "../lib/fs.js";
import { readState } from "../lib/state.js";
import { println, exitWith } from "../lib/output.js";

function resolveRun(args, root) {
  if (args.run && args.run !== "null") return String(args.run);
  return readState(root).current_run;
}

export function archiveCommand(args, context) {
  const runId = resolveRun(args, context.target);
  if (!runId) {
    exitWith("Usage: codex-spec archive --run <run-id> [--force]");
    return;
  }

  const runPath = path.join(context.target, ".agentflow", "runs", runId);
  if (!exists(runPath)) {
    exitWith(`Run not found: ${path.relative(context.target, runPath)}`);
    return;
  }

  const archiveRoot = path.join(context.target, ".agentflow", "archives");
  const archivePath = path.join(archiveRoot, runId);
  ensureDir(archiveRoot);
  if (exists(archivePath)) {
    if (!args.force) {
      exitWith(`Archive already exists: ${path.relative(context.target, archivePath)}. Use --force to overwrite.`);
      return;
    }
    fs.rmSync(archivePath, { recursive: true, force: true });
  }
  fs.cpSync(runPath, archivePath, { recursive: true });
  println(`Archived run: ${path.relative(context.target, archivePath)}`);
}
