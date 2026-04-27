import { readState, writeState, PHASES } from "../lib/state.js";
import { exitWith, println } from "../lib/output.js";

const PLANNING_TRACKS = ["explore", "preflight"];

function parseBool(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}

function nullableArg(value) {
  if (value === undefined || value === null || value === "" || value === "null") return null;
  return String(value);
}

export function stateCommand(args, context) {
  const action = args._[1];
  if (action !== "set") {
    exitWith("Usage: codex-spec state set [--phase <phase>] [--mode <mode>] [--planning-session <id>] [--planning-track explore|preflight|null] [--run <run-id>] [--milestone <id>] [--blocked true|false]");
    return;
  }
  const state = readState(context.target);
  const hasPlanningSessionArg = Object.prototype.hasOwnProperty.call(args, "planning-session");
  const hasPlanningTrackArg = Object.prototype.hasOwnProperty.call(args, "planning-track");
  if (args.phase) {
    const phase = String(args.phase);
    if (!PHASES.includes(phase)) {
      exitWith(`Invalid phase: ${phase}. Allowed: ${PHASES.join(", ")}`);
      return;
    }
    state.current_phase = phase;
  }
  if (args.mode) state.mode = String(args.mode);
  if (hasPlanningSessionArg) state.current_planning_session = nullableArg(args["planning-session"]);
  if (hasPlanningTrackArg) {
    const track = nullableArg(args["planning-track"]);
    if (track && !PLANNING_TRACKS.includes(track)) {
      exitWith(`Invalid planning track: ${track}. Allowed: ${PLANNING_TRACKS.join(", ")}`);
      return;
    }
    state.planning_track = track;
  }
  if (Boolean(state.current_planning_session) !== Boolean(state.planning_track)) {
    exitWith("--planning-session and --planning-track must be set or cleared together");
    return;
  }
  if (Object.prototype.hasOwnProperty.call(args, "run")) state.current_run = nullableArg(args.run);
  if (Object.prototype.hasOwnProperty.call(args, "milestone")) state.current_milestone = nullableArg(args.milestone);
  if (Object.prototype.hasOwnProperty.call(args, "blocked")) {
    const v = parseBool(args.blocked);
    if (v === null) {
      exitWith("--blocked must be true or false");
      return;
    }
    state.blocked = v;
  }
  state.updated_by = "codex-spec state set";
  writeState(context.target, state);
  println(JSON.stringify(state, null, 2));
}
