import { listMissing } from "../lib/fs.js";
import { println, exitWith } from "../lib/output.js";

const REQUIRED = [
  ".codex/config.toml",
  ".codex/agents/pm.toml",
  ".codex/agents/architect.toml",
  ".codex/agents/tester.toml",
  ".codex/agents/developer.toml",
  ".codex/agents/doc-reviewer.toml",
  ".codex/agents/code-reviewer.toml",
  ".codex/agents/auditor.toml",
  ".codex/prompts/main-thread.md",
  ".codex/prompts/glossary.md",
  ".codex/prompts/file-index.md",
  ".codex/prompts/report-contract.md",
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
  ".agents/skills/execute/SKILL.md",
  ".agents/skills/auto/SKILL.md",
  ".agents/skills/status/SKILL.md",
  ".agents/skills/resume/SKILL.md",
  "codexspec/vision.md",
  "codexspec/roadmap.md",
  "codexspec/adr/00-adr-guide.md",
  "codexspec/spec/00-spec-guide.md",
  "codexspec/spec/test-plan/00-test-plan-guide.md",
  "codexspec/runtime/state.json",
  "codexspec/runtime/explore/.gitkeep",
  "codexspec/runtime/preflight/.gitkeep",
  "codexspec/runtime/runs/.gitkeep",
  "codexspec/runtime/archives/.gitkeep",
  "codexspec/runtime/archives/runs/.gitkeep",
  "codexspec/runtime/archives/explore/.gitkeep",
  "codexspec/runtime/archives/preflight/.gitkeep"
];

export function doctorCommand(_args, context) {
  const root = context.target;
  const missing = listMissing(root, REQUIRED);
  const problems = [];
  if (missing.length) problems.push(`Missing files:\n${missing.map((m) => `  - ${m}`).join("\n")}`);

  if (problems.length) {
    exitWith(`codex-spec doctor: failed\n\n${problems.join("\n\n")}`);
    return;
  }
  println(`codex-spec doctor: OK (${root})`);
}
