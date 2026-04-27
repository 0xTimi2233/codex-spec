import path from "node:path";
import { exists, readText } from "../lib/fs.js";
import { readState } from "../lib/state.js";
import { println } from "../lib/output.js";

export function statusCommand(_args, context) {
  const root = context.target;
  const state = readState(root);
  println(`Project: ${root}`);
  println(`Mode: ${state.mode}`);
  println(`Phase: ${state.current_phase}`);
  println(`Planning track: ${state.planning_track || "-"}`);
  println(`Planning session: ${state.current_planning_session || "-"}`);
  println(`Run: ${state.current_run || "-"}`);
  println(`Milestone: ${state.current_milestone || "-"}`);
  println(`Blocked: ${state.blocked ? "yes" : "no"}`);
  const run = state.current_run ? path.join(root, ".agentflow", "runs", state.current_run) : null;
  if (run && exists(path.join(run, "dispatch-ledger.md"))) {
    println("\nDispatch ledger:");
    println(readText(path.join(run, "dispatch-ledger.md")));
  }
  if (run && exists(path.join(run, "summary.md"))) {
    println("\nCurrent run summary:");
    println(readText(path.join(run, "summary.md")));
  }
}
