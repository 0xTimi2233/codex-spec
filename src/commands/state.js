import { readState, writeState, PHASES } from "../lib/state.js";
import { exitWith, println } from "../lib/output.js";

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
    exitWith("Usage: codex-spec state set --phase <phase> [--mode <mode>] [--run <run-id>] [--milestone <id>] [--blocked true|false]");
    return;
  }
  const state = readState(context.target);
  if (args.phase) {
    const phase = String(args.phase);
    if (!PHASES.includes(phase)) {
      exitWith(`Invalid phase: ${phase}. Allowed: ${PHASES.join(", ")}`);
      return;
    }
    state.current_phase = phase;
  }
  if (args.mode) state.mode = String(args.mode);
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
