import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, runCliFail, runHook, tempDir } from "./test-utils.js";

const tmp = tempDir("codex-spec-dist-");
runCli("dist", ["init", "--lang", "en", "--model", "xhigh", "--fast", "off", "--target", tmp]);

const config = readText(tmp, ".codex", "config.toml");
const developerAgent = readText(tmp, ".codex", "agents", "developer.toml");
assert(config.includes('model = "gpt-5.5"'), "model was not rendered");
assert(config.includes('model_reasoning_effort = "xhigh"'), "xhigh profile was not rendered");
assert(!config.includes("service_tier"), "fast mode off should not render service_tier");
assert(developerAgent.includes('model = "gpt-5.5"'), "developer model should be explicit");
assert(developerAgent.includes('model_reasoning_effort = "xhigh"'), "xhigh profile should render xhigh agent reasoning");

runCli("dist", ["--version"]);
runCli("dist", ["doctor", "--target", tmp]);
runCli("dist", ["status", "--target", tmp]);

const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");

const invalidArchive = runCliFail("dist", ["archive", "--run", "../bad", "--target", tmp]);
assert(invalidArchive.includes("Invalid run id"), "archive should reject unsafe run ids");

runCli("dist", ["archive", "--run", "smoke-run", "--target", tmp]);
assert(!fs.existsSync(runDir), "archive should move run out of runs/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "smoke-run")), "archive directory was not created");

const hookRunDir = path.join(tmp, ".agentflow", "runs", "dist-hook-run");
fs.mkdirSync(hookRunDir, { recursive: true });
fs.writeFileSync(
  path.join(tmp, ".agentflow", "state.json"),
  JSON.stringify(
    {
      version: 1,
      mode: "active",
      current_run: "dist-hook-run",
      current_phase: "executing",
      current_milestone: "dist",
      blocked: false,
      updated_by: "dist smoke"
    },
    null,
    2
  )
);
fs.writeFileSync(
  path.join(hookRunDir, "gate.md"),
  `---
status: approved
allowed_source_paths:
  - src/**
allowed_test_paths:
  - tests/**
required_tests:
  - npm test
doc_review_report: .agentflow/runs/dist-hook-run/doc-reviewer/review-report.md
---
`,
  "utf8"
);

const allowedDistHook = runHook(
  "pre-tool-use",
  tmp,
  {
    cwd: tmp,
    tool_name: "Write",
    tool_input: { file_path: "src/example.js" }
  },
  { kind: "dist" }
);
assert(allowedDistHook.continue === true, "dist pre-tool-use should allow approved source paths");

const deniedDistHook = runHook(
  "pre-tool-use",
  tmp,
  {
    cwd: tmp,
    tool_name: "Write",
    tool_input: { file_path: "README.md" }
  },
  { kind: "dist" }
);
assert(deniedDistHook.hookSpecificOutput?.permissionDecision === "deny", "dist pre-tool-use should deny paths outside the approved gate");

console.log(`dist smoke OK: ${tmp}`);
