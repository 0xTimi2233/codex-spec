import path from "node:path";
import { exists, readJson, readText } from "../lib/fs.js";
import { readState } from "../lib/state.js";
import { println } from "../lib/output.js";

export function statusCommand(_args, context) {
  const root = context.target;
  const state = readState(root);
  println(`Project: ${root}`);
  println(`Mode: ${state.mode}`);
  println(`Phase: ${state.current_phase}`);
  println(`Run: ${state.current_run || "-"}`);
  println(`Milestone: ${state.current_milestone || "-"}`);
  println(`Blocked: ${state.blocked ? "yes" : "no"}`);
  const run = state.current_run ? path.join(root, ".agentflow", "runs", state.current_run) : null;
  if (run && exists(path.join(run, "agents.json"))) {
    const registry = readJson(path.join(run, "agents.json"), { agents: [] });
    const agents = Array.isArray(registry.agents) ? registry.agents : [];
    println(`Agents: ${agents.length}`);
    for (const agent of agents) {
      const role = agent.role || "unknown";
      const status = agent.status || "unknown";
      const id = agent.agent_id || "-";
      println(`  - ${role}: ${status} (${id})`);
    }
  }
  if (run && exists(path.join(run, "summary.md"))) {
    println("\nCurrent run summary:");
    println(readText(path.join(run, "summary.md")));
  }
}
