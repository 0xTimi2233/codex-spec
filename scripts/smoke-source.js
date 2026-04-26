import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "codex-spec-source-"));
function run(args) {
  const res = spawnSync(process.execPath, [path.join(root, "src", "cli.js"), ...args], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status || 1);
  }
  return res.stdout;
}
function runHook(name, cwd, payload) {
  const res = spawnSync(process.execPath, [path.join(root, "src", "hooks", `${name}.js`)], {
    cwd,
    input: JSON.stringify(payload),
    encoding: "utf8"
  });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status || 1);
  }
  return JSON.parse(res.stdout);
}
run(["init", "--lang", "zh", "--target", tmp]);
const defaultConfig = fs.readFileSync(path.join(tmp, ".codex", "config.toml"), "utf8");
if (!defaultConfig.includes('model = "gpt-5.5"')) throw new Error("default model was not rendered");
if (!defaultConfig.includes('model_reasoning_effort = "high"')) throw new Error("default reasoning was not rendered");
if (defaultConfig.includes("service_tier")) throw new Error("fast mode should be off by default");
run(["--version"]);
run(["doctor", "--target", tmp]);
run(["status", "--target", tmp]);
const highTmp = fs.mkdtempSync(path.join(os.tmpdir(), "codex-spec-source-high-"));
run(["init", "--lang", "en", "--model", "high", "--fast", "on", "--target", highTmp]);
const highConfig = fs.readFileSync(path.join(highTmp, ".codex", "config.toml"), "utf8");
const pmAgent = fs.readFileSync(path.join(highTmp, ".codex", "agents", "pm.toml"), "utf8");
const architectAgent = fs.readFileSync(path.join(highTmp, ".codex", "agents", "architect.toml"), "utf8");
const developerAgent = fs.readFileSync(path.join(highTmp, ".codex", "agents", "developer.toml"), "utf8");
if (!highConfig.includes('service_tier = "fast"')) throw new Error("fast mode was not rendered");
if (!pmAgent.includes('model_reasoning_effort = "xhigh"')) throw new Error("pm xhigh override was not rendered");
if (!architectAgent.includes('model_reasoning_effort = "xhigh"')) throw new Error("architect xhigh override was not rendered");
if (developerAgent.includes('model_reasoning_effort = "xhigh"')) throw new Error("developer should inherit high profile reasoning");
const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");
run(["archive", "--run", "smoke-run", "--target", tmp]);
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(tmp, ".agentflow", "state.json"), JSON.stringify({
  version: 1,
  mode: "active",
  current_run: "smoke-run",
  current_phase: "executing",
  current_milestone: "smoke",
  blocked: false,
  updated_by: "smoke"
}, null, 2));
fs.writeFileSync(path.join(runDir, "gate.md"), `---
status: approved
allowed_source_paths:
  - src/**
allowed_test_paths:
  - tests/**
required_tests:
  - npm test
doc_review_report: .agentflow/runs/smoke-run/doc-reviewer/review-report.md
---
`, "utf8");
const allowedHook = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Write",
  tool_input: { file_path: "src/example.js" }
});
if (allowedHook.continue !== true) throw new Error("approved gate should allow source path");
const deniedHook = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Write",
  tool_input: { file_path: "README.md" }
});
if (deniedHook.hookSpecificOutput?.permissionDecision !== "deny") throw new Error("approved gate should deny paths outside allowed scope");
console.log(`source smoke OK: ${tmp}`);
