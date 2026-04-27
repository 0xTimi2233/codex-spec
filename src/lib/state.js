import path from "node:path";
import { readJson, writeJson } from "./fs.js";

export const PHASES = [
  "idle",
  "planning",
  "designing",
  "doc-reviewing",
  "ready-to-execute",
  "executing",
  "code-reviewing",
  "ready-to-finish",
  "finishing",
  "blocked"
];

export function defaultState() {
  return {
    version: 1,
    current_planning_session: null,
    planning_track: null,
    current_run: null,
    current_phase: "idle",
    current_milestone: null,
    blocked: false,
    updated_by: "codex-spec"
  };
}

export function normalizeState(state) {
  const fallback = defaultState();
  const next = { ...fallback, ...(state || {}) };
  delete next.current_brainstorm;
  delete next.current_preflight;
  delete next.mode;
  if (!PHASES.includes(next.current_phase)) next.current_phase = "idle";
  if (typeof next.blocked !== "boolean") next.blocked = Boolean(next.blocked);
  if (next.current_run === "") next.current_run = null;
  if (next.current_planning_session === "") next.current_planning_session = null;
  if (!["explore", "preflight"].includes(next.planning_track)) next.planning_track = null;
  if (next.current_milestone === "") next.current_milestone = null;
  return next;
}

export function statePath(root) {
  return path.join(root, "agentflow", "runtime", "state.json");
}

export function readState(root) {
  return normalizeState(readJson(statePath(root), defaultState()));
}

export function writeState(root, state) {
  writeJson(statePath(root), normalizeState(state), { force: true });
}

export function currentRunPath(root, state = readState(root)) {
  return state.current_run ? path.join(root, "agentflow", "runtime", "runs", state.current_run) : null;
}
