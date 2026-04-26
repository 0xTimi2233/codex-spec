import fs from "node:fs";
import path from "node:path";
import { readState, currentRunPath } from "../lib/state.js";
import { findProjectRoot } from "../lib/paths.js";
import { normalizeRepoPath } from "../lib/gate.js";

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

function collectStringValues(value, out = []) {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, out);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStringValues(item, out);
  }
  return out;
}

function patchTextFromInput(input) {
  if (typeof input === "string") return input;
  for (const key of ["patch", "input", "text", "diff", "content"]) {
    if (typeof input?.[key] === "string" && input[key].includes("*** Begin Patch")) return input[key];
  }
  return collectStringValues(input).find((value) => value.includes("*** Begin Patch")) || "";
}

function tokenizeShell(command) {
  const tokens = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < command.length; i += 1) {
    const char = command[i];
    const next = command[i + 1];
    if (quote) {
      if (char === quote) quote = null;
      else if (char === "\\" && quote === "\"" && next) {
        current += next;
        i += 1;
      } else {
        current += char;
      }
      continue;
    }
    if (char === "'" || char === "\"") {
      quote = char;
      continue;
    }
    if (char === "\\" && next) {
      current += next;
      i += 1;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    if (";&|()".includes(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
      continue;
    }
    if (char === ">") {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(next === ">" ? ">>" : ">");
      if (next === ">") i += 1;
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

function isBoundaryToken(token) {
  return [";", "&", "|", "(", ")"].includes(token);
}

function isOption(token) {
  return token.startsWith("-") && token !== "-";
}

function collectCommandArgs(tokens, index) {
  const args = [];
  for (let i = index + 1; i < tokens.length && !isBoundaryToken(tokens[i]); i += 1) args.push(tokens[i]);
  return args;
}

function nonOptionArgs(args) {
  return args.filter((arg) => !isOption(arg));
}

function hasAnyFlag(args, flags) {
  return args.some((arg) => flags.some((flag) => arg === flag || arg.startsWith(`${flag}=`)));
}

function analyzeBash(command) {
  const tokens = tokenizeShell(command);
  const targets = [];
  let writes = false;
  let ambiguous = false;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (/^\d?>{1,2}$/.test(token)) {
      writes = true;
      if (tokens[i + 1] && !isBoundaryToken(tokens[i + 1])) targets.push(tokens[i + 1]);
      else ambiguous = true;
    }
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const commandName = path.basename(tokens[i]);
    const args = collectCommandArgs(tokens, i);
    if (!args.length && !["git"].includes(commandName)) continue;

    if (["touch", "mkdir", "rm", "tee", "truncate"].includes(commandName)) {
      writes = true;
      const paths = nonOptionArgs(args);
      if (paths.length) targets.push(...paths);
      else ambiguous = true;
    } else if (commandName === "cp") {
      writes = true;
      const paths = nonOptionArgs(args);
      if (paths.length >= 2) targets.push(paths[paths.length - 1]);
      else ambiguous = true;
    } else if (commandName === "mv") {
      writes = true;
      const paths = nonOptionArgs(args);
      if (paths.length >= 2) targets.push(...paths);
      else ambiguous = true;
    } else if (commandName === "dd") {
      writes = true;
      const out = args.find((arg) => arg.startsWith("of="));
      if (out) targets.push(out.slice(3));
      else ambiguous = true;
    } else if (["sed", "perl"].includes(commandName) && args.some((arg) => /^-[A-Za-z]*i/.test(arg) || /^-[A-Za-z]*p[A-Za-z]*i/.test(arg))) {
      writes = true;
      ambiguous = true;
    } else if (["python", "python3"].includes(commandName) && hasAnyFlag(args, ["-c"])) {
      writes = true;
      ambiguous = true;
    } else if (commandName === "node" && hasAnyFlag(args, ["-e", "--eval"])) {
      writes = true;
      ambiguous = true;
    } else if (commandName === "git" && ["checkout", "reset", "clean", "restore"].includes(args[0])) {
      writes = true;
      ambiguous = true;
    }
  }

  return { writes, targets, ambiguous };
}

export function analyzeWriteEffect(tool, toolInput) {
  const input = toolInput || {};
  if (/^(Write|Edit)$/.test(tool)) {
    return {
      writes: true,
      ambiguous: false,
      targets: collectStringValues({
      file_path: input.file_path,
      path: input.path,
      filename: input.filename,
      target_file: input.target_file
      }).filter(Boolean)
    };
  }
  if (tool === "apply_patch") {
    const patch = patchTextFromInput(input);
    const matches = [...patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm), ...patch.matchAll(/^\*\*\* Move to: (.+)$/gm)];
    return {
      writes: true,
      ambiguous: !patch || !matches.length,
      targets: matches.map((match) => match[1].trim()).filter(Boolean)
    };
  }
  if (tool === "Bash") {
    const cmd = String(input.command || input.cmd || "");
    return analyzeBash(cmd);
  }
  return { writes: false, ambiguous: false, targets: [] };
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
