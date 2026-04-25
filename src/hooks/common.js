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
  if (phase === "ready-to-execute" || phase === "planning") {
    return [path.join(runPath, "task.md"), path.join(runPath, "gate.md")];
  }
  if (phase === "executing" || phase === "ready-to-review") {
    return [
      path.join(runPath, "gate.md"),
      path.join(runPath, "developer", "implementation-report.md"),
      path.join(runPath, "developer", "changed-files.md")
    ];
  }
  if (phase === "reviewing" || phase === "ready-to-finish") {
    return [
      path.join(runPath, "reviewer", "review-report.md"),
      path.join(runPath, "tester", "test-report.md")
    ];
  }
  if (phase === "finishing") {
    return [path.join(runPath, "summary.md")];
  }
  return [];
}

export function missingRunFiles(root, runPath, phase) {
  return requiredRunFiles(runPath, phase)
    .filter((p) => !fileExists(p))
    .map((p) => path.relative(root, p));
}
