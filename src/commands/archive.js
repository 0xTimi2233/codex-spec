import fs from "node:fs";
import path from "node:path";
import { ensureDir, exists } from "../lib/fs.js";
import { readState, writeState } from "../lib/state.js";
import { println, exitWith } from "../lib/output.js";

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

function clearArchivedBrainstorm(root, brainstormId) {
  const state = readState(root);
  if (state.current_brainstorm !== brainstormId) return;
  state.current_brainstorm = null;
  state.updated_by = "codex-spec archive";
  writeState(root, state);
}

function clearArchivedRun(root, runId) {
  const state = readState(root);
  if (state.current_run !== runId) return;
  state.mode = "idle";
  state.current_run = null;
  state.current_phase = "idle";
  state.current_milestone = null;
  state.blocked = false;
  state.updated_by = "codex-spec archive";
  writeState(root, state);
}

export function archiveCommand(args, context) {
  if (args.brainstorm) {
    const brainstormId = String(args.brainstorm);
    if (!isSafeId(brainstormId)) {
      exitWith(`Invalid brainstorm id: ${brainstormId}`);
      return;
    }
    const archived = moveImmutable({
      root: context.target,
      kind: "Brainstorm",
      srcPath: path.join(context.target, ".agentflow", "brainstorm", brainstormId),
      archivePath: path.join(context.target, ".agentflow", "archives", "brainstorm", brainstormId)
    });
    if (archived) clearArchivedBrainstorm(context.target, brainstormId);
    return;
  }

  const resolvedRunId = resolveRun(args, context.target);
  if (!resolvedRunId) {
    exitWith("Usage: codex-spec archive --run <run-id> | --brainstorm <brainstorm-id>");
    return;
  }
  const runId = String(resolvedRunId);
  if (!isSafeId(runId)) {
    exitWith(`Invalid run id: ${runId}`);
    return;
  }

  const archived = moveImmutable({
    root: context.target,
    kind: "Run",
    srcPath: path.join(context.target, ".agentflow", "runs", runId),
    archivePath: path.join(context.target, ".agentflow", "archives", runId)
  });
  if (archived) clearArchivedRun(context.target, runId);
}
