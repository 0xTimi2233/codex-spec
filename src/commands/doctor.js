import fs from "node:fs";
import path from "node:path";
import { exists, listMissing, readText } from "../lib/fs.js";
import { println, exitWith } from "../lib/output.js";

const REQUIRED = [
  "AGENTS.md",
  ".codex/config.toml",
  ".codex/agents/pm.toml",
  ".codex/agents/architect.toml",
  ".codex/agents/tester.toml",
  ".codex/agents/developer.toml",
  ".codex/agents/doc-reviewer.toml",
  ".codex/agents/code-reviewer.toml",
  ".codex/agents/auditor.toml",
  ".codex/prompts/main-thread.md",
  ".codex/prompts/file-protocol.md",
  ".codex/prompts/subagent-contract.md",
  ".codex/prompts/roles/pm.md",
  ".codex/prompts/roles/architect.md",
  ".codex/prompts/roles/tester.md",
  ".codex/prompts/roles/doc-reviewer.md",
  ".codex/prompts/roles/developer.md",
  ".codex/prompts/roles/code-reviewer.md",
  ".codex/prompts/roles/auditor.md",
  ".codex/prompts/project/product-rules.md",
  ".codex/prompts/project/architecture-rules.md",
  ".codex/prompts/project/coding-standards.md",
  ".codex/prompts/project/testing-standards.md",
  ".codex/prompts/project/doc-review-policy.md",
  ".codex/prompts/project/code-review-policy.md",
  ".agents/skills/plan/SKILL.md",
  ".agents/skills/design/SKILL.md",
  ".agents/skills/doc-review/SKILL.md",
  ".agents/skills/execute/SKILL.md",
  ".agents/skills/code-review/SKILL.md",
  ".agents/skills/verify/SKILL.md",
  ".agents/skills/finish/SKILL.md",
  ".agents/skills/auto/SKILL.md",
  ".agents/skills/status/SKILL.md",
  ".agents/skills/resume/SKILL.md",
  "agentflow/vision.md",
  "agentflow/roadmap.md",
  "agentflow/adr/00-adr-guide.md",
  "agentflow/spec/00-spec-guide.md",
  "agentflow/spec/test-plan/00-test-plan-guide.md",
  ".agentflow/state.json",
  ".agentflow/runs/.gitkeep",
  ".agentflow/archives/.gitkeep"
];

export function doctorCommand(_args, context) {
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

  if (problems.length) {
    exitWith(`codex-spec doctor: failed\n\n${problems.join("\n\n")}`);
    return;
  }
  println(`codex-spec doctor: OK (${root})`);
}
