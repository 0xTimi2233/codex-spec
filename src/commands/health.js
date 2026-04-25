import fs from "node:fs";
import path from "node:path";
import { exists, listMissing, readText } from "../lib/fs.js";
import { readState, currentRunPath } from "../lib/state.js";
import { println, exitWith } from "../lib/output.js";

const REQUIRED = [
  "AGENTS.md",
  ".codex/config.toml",
  ".codex/agents/pm.toml",
  ".codex/agents/architect.toml",
  ".codex/agents/tester.toml",
  ".codex/agents/developer.toml",
  ".codex/agents/reviewer.toml",
  ".codex/agents/researcher.toml",
  ".codex/agents/performance.toml",
  ".codex/prompts/main-workflow.md",
  ".codex/prompts/file-protocol.md",
  ".codex/prompts/role-common.md",
  ".agents/skills/plan/SKILL.md",
  ".agents/skills/execute/SKILL.md",
  ".agents/skills/review/SKILL.md",
  ".agents/skills/finish/SKILL.md",
  ".agents/skills/auto/SKILL.md",
  ".agents/skills/health/SKILL.md",
  ".agents/skills/status/SKILL.md",
  ".agents/skills/pause/SKILL.md",
  ".agents/skills/resume/SKILL.md",
  "agentflow/vision.md",
  "agentflow/roadmap.md",
  "agentflow/adr/00-adr-guide.md",
  "agentflow/spec/00-spec-guide.md",
  "agentflow/spec/test-plan/00-test-plan-guide.md",
  ".agentflow/state.json",
  ".agentflow/handoff.md"
];

function requiredForPhase(root, state) {
  if (!state.current_run) return [];
  const runPath = currentRunPath(root, state);
  if (state.current_phase === "planning" || state.current_phase === "ready-to-execute") {
    return [path.join(runPath, "task.md"), path.join(runPath, "gate.md")];
  }
  if (state.current_phase === "executing" || state.current_phase === "ready-to-review") {
    return [
      path.join(runPath, "gate.md"),
      path.join(runPath, "developer", "implementation-report.md"),
      path.join(runPath, "developer", "changed-files.md")
    ];
  }
  if (state.current_phase === "reviewing" || state.current_phase === "ready-to-finish") {
    return [
      path.join(runPath, "reviewer", "review-report.md"),
      path.join(runPath, "tester", "test-report.md")
    ];
  }
  if (state.current_phase === "finishing") return [path.join(runPath, "summary.md")];
  return [];
}

export function healthCommand(_args, context) {
  const root = context.target;
  const missing = listMissing(root, REQUIRED);
  const problems = [];
  if (missing.length) problems.push(`Missing files:\n${missing.map((m) => `  - ${m}`).join("\n")}`);

  const cfg = path.join(root, ".codex", "config.toml");
  if (exists(cfg)) {
    const content = readText(cfg);
    const matches = [...content.matchAll(/node \\"([^\"]+)\\"|node "([^"]+)"/g)];
    for (const match of matches) {
      const hookPath = match[1] || match[2];
      if (hookPath && !fs.existsSync(hookPath)) problems.push(`Hook script not found: ${hookPath}`);
    }
  }

  if (exists(path.join(root, ".agentflow", "state.json"))) {
    const state = readState(root);
    const phaseMissing = requiredForPhase(root, state).filter((p) => !fs.existsSync(p)).map((p) => path.relative(root, p));
    if (phaseMissing.length) problems.push(`Current phase '${state.current_phase}' is missing run artifacts:\n${phaseMissing.map((m) => `  - ${m}`).join("\n")}`);
  }

  if (problems.length) {
    exitWith(`codex-spec health: failed\n\n${problems.join("\n\n")}`);
    return;
  }
  println(`codex-spec health: OK (${root})`);
}
