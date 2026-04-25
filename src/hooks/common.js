import fs from "node:fs";
import path from "node:path";
import { readState, currentRunPath } from "../lib/state.js";
import { findProjectRoot } from "../lib/paths.js";

export async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function resolveRoot(input) {
  return findProjectRoot(input.cwd || process.cwd());
}

export function jsonOut(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

export function additionalContext(event, text) {
  jsonOut({
    hookSpecificOutput: {
      hookEventName: event,
      additionalContext: text
    }
  });
}

export function blockPreToolUse(reason) {
  jsonOut({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason
    }
  });
}

export function continueOk() {
  jsonOut({ continue: true });
}

export function currentSummary(root) {
  const state = readState(root);
  const runPath = currentRunPath(root, state);
  const relRun = runPath ? path.relative(root, runPath) : null;
  return { state, runPath, relRun };
}

export function fileExists(p) {
  return p ? fs.existsSync(p) : false;
}

export function isWorkflowPath(toolInput) {
  const text = JSON.stringify(toolInput || {});
  return text.includes("agentflow/") || text.includes(".agentflow/") || text.includes("AGENTS.md") || text.includes(".codex/") || text.includes(".agents/");
}

export function requiredRunFiles(runPath, phase) {
  if (!runPath) return [];
  const base = [path.join(runPath, "dispatch-ledger.md")];
  if (phase === "planning") {
    return [...base, path.join(runPath, "task.md"), path.join(runPath, "pm", "requirements.md")];
  }
  if (phase === "designing") {
    return [
      ...base,
      path.join(runPath, "architect", "design.md"),
      path.join(runPath, "architect", "spec-draft.md"),
      path.join(runPath, "architect", "adr-draft.md"),
      path.join(runPath, "tester", "test-plan.md")
    ];
  }
  if (phase === "doc-reviewing") {
    return [
      ...base,
      path.join(runPath, "doc-reviewer", "review-report.md"),
      path.join(runPath, "doc-reviewer", "review-ledger.md")
    ];
  }
  if (phase === "ready-to-execute") {
    return [...base, path.join(runPath, "gate.md")];
  }
  if (phase === "executing") {
    return [
      ...base,
      path.join(runPath, "gate.md"),
      path.join(runPath, "developer", "implementation-report.md"),
      path.join(runPath, "developer", "changed-files.md"),
      path.join(runPath, "developer", "test-result.md")
    ];
  }
  if (phase === "code-reviewing") {
    return [
      ...base,
      path.join(runPath, "code-reviewer", "review-report.md"),
      path.join(runPath, "code-reviewer", "review-ledger.md")
    ];
  }
  if (phase === "ready-to-finish") {
    return [...base, path.join(runPath, "gate.md"), path.join(runPath, "code-reviewer", "review-report.md")];
  }
  if (phase === "finishing") {
    return [...base, path.join(runPath, "auditor", "audit-report.md"), path.join(runPath, "summary.md")];
  }
  if (phase === "blocked") {
    return [...base, path.join(runPath, "summary.md")];
  }
  return base;
}

export function missingRunFiles(root, runPath, phase) {
  return requiredRunFiles(runPath, phase)
    .filter((p) => !fileExists(p))
    .map((p) => path.relative(root, p));
}
