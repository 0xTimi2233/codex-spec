import fs from "node:fs";
import path from "node:path";
import { ensureDir, exists } from "../lib/fs.js";
import { readState } from "../lib/state.js";
import { println, exitWith } from "../lib/output.js";

function resolveRun(args, root) {
  if (args.run && args.run !== "null") return String(args.run);
  return readState(root).current_run;
}

function isSafeRunId(runId) {
  const value = String(runId);
  return /^[A-Za-z0-9._-]+$/.test(value) && value !== "." && value !== ".." && !value.includes("..");
}

export function archiveCommand(args, context) {
  const resolvedRunId = resolveRun(args, context.target);
  if (!resolvedRunId) {
    exitWith("Usage: codex-spec archive --run <run-id>");
    return;
  }
  const runId = String(resolvedRunId);
  if (!isSafeRunId(runId)) {
    exitWith(`Invalid run id: ${runId}`);
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
    exitWith(`Archive already exists: ${path.relative(context.target, archivePath)}. Archives are immutable.`);
    return;
  }
  fs.renameSync(runPath, archivePath);
  println(`Archived run: ${path.relative(context.target, archivePath)}`);
}
