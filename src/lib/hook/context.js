import path from "node:path";
import { findProjectRoot } from "../paths.js";
import { currentRunPath, readState } from "../state.js";

export function resolveRoot(input) {
  return findProjectRoot(input.cwd || process.cwd());
}

export function currentSummary(root) {
  const state = readState(root);
  const runPath = currentRunPath(root, state);
  const relRun = runPath ? path.relative(root, runPath) : null;
  return { state, runPath, relRun };
}
