import fs from "node:fs";
import path from "node:path";
import { normalizeRepoPath } from "../gate.js";

export function fileExists(p) {
  return p ? fs.existsSync(p) : false;
}

export function isWorkflowPath(root, target) {
  const rel = normalizeRepoPath(root, target);
  return Boolean(
    rel &&
      (rel === "AGENTS.md" ||
        rel.startsWith("agentflow/") ||
        rel.startsWith(".agentflow/") ||
        rel.startsWith(".codex/") ||
        rel.startsWith(".agents/"))
  );
}

export function requiredRunFiles(runPath, phase) {
  if (!runPath) return [];
  const base = [path.join(runPath, "dispatch-ledger.md")];
  const phaseFiles = {
    planning: [path.join(runPath, "task.md"), path.join(runPath, "pm", "requirements.md")],
    designing: [
      path.join(runPath, "architect", "design.md"),
      path.join(runPath, "architect", "spec-draft.md"),
      path.join(runPath, "architect", "adr-draft.md"),
      path.join(runPath, "tester", "test-plan.md")
    ],
    "doc-reviewing": [
      path.join(runPath, "doc-reviewer", "review-report.md"),
      path.join(runPath, "doc-reviewer", "review-ledger.md")
    ],
    "ready-to-execute": [path.join(runPath, "gate.md")],
    executing: [
      path.join(runPath, "gate.md"),
      path.join(runPath, "developer", "implementation-report.md"),
      path.join(runPath, "developer", "changed-files.md"),
      path.join(runPath, "developer", "test-result.md")
    ],
    "code-reviewing": [
      path.join(runPath, "code-reviewer", "review-report.md"),
      path.join(runPath, "code-reviewer", "review-ledger.md")
    ],
    "ready-to-finish": [path.join(runPath, "gate.md"), path.join(runPath, "code-reviewer", "review-report.md")],
    finishing: [path.join(runPath, "auditor", "audit-report.md"), path.join(runPath, "summary.md")],
    blocked: [path.join(runPath, "summary.md")]
  };
  return [...base, ...(phaseFiles[phase] || [])];
}

export function missingRunFiles(root, runPath, phase) {
  return requiredRunFiles(runPath, phase)
    .filter((p) => !fileExists(p))
    .map((p) => path.relative(root, p));
}
