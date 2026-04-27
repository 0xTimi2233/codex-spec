import fs from "node:fs";
import path from "node:path";
import { ensureDir, exists } from "../lib/fs.js";
import { println, exitWith } from "../lib/output.js";
import { readState } from "../lib/state.js";

function resolveRun(args, root) {
  if (args.run && args.run !== "null") return String(args.run);
  return readState(root).current_run;
}

function isSafeId(value) {
  const normalized = String(value);
  return /^[A-Za-z0-9._-]+$/.test(normalized) && normalized !== "." && normalized !== ".." && !normalized.includes("..");
}

function moveImmutable({ root, kind, srcPath, archivePath }) {
  if (!exists(srcPath)) {
    exitWith(`${kind} not found: ${path.relative(root, srcPath)}`);
    return false;
  }

  ensureDir(path.dirname(archivePath));
  if (exists(archivePath)) {
    exitWith(`Archive already exists: ${path.relative(root, archivePath)}. Archives are immutable.`);
    return false;
  }
  fs.renameSync(srcPath, archivePath);
  println(`Archived ${kind.toLowerCase()}: ${path.relative(root, archivePath)}`);
  return true;
}

export function archiveCommand(args, context) {
  if (args.explore) {
    const exploreId = String(args.explore);
    if (!isSafeId(exploreId)) {
      exitWith(`Invalid explore id: ${exploreId}`);
      return;
    }
    moveImmutable({
      root: context.target,
      kind: "Explore",
      srcPath: path.join(context.target, ".agentflow", "explore", exploreId),
      archivePath: path.join(context.target, ".agentflow", "archives", "explore", exploreId)
    });
    return;
  }

  if (args.preflight) {
    const preflightId = String(args.preflight);
    if (!isSafeId(preflightId)) {
      exitWith(`Invalid preflight id: ${preflightId}`);
      return;
    }
    moveImmutable({
      root: context.target,
      kind: "Preflight",
      srcPath: path.join(context.target, ".agentflow", "preflight", preflightId),
      archivePath: path.join(context.target, ".agentflow", "archives", "preflight", preflightId)
    });
    return;
  }

  const resolvedRunId = resolveRun(args, context.target);
  if (!resolvedRunId) {
    exitWith("Usage: codex-spec-internal archive --run <run-id> | --explore <explore-id> | --preflight <preflight-id>");
    return;
  }
  const runId = String(resolvedRunId);
  if (!isSafeId(runId)) {
    exitWith(`Invalid run id: ${runId}`);
    return;
  }

  moveImmutable({
    root: context.target,
    kind: "Run",
    srcPath: path.join(context.target, ".agentflow", "runs", runId),
    archivePath: path.join(context.target, ".agentflow", "archives", runId)
  });
}
