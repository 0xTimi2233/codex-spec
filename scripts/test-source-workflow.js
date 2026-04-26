import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, runCliFail, tempDir } from "./test-utils.js";

const tmp = tempDir("codex-spec-source-workflow-");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);

const config = readText(tmp, ".codex", "config.toml");
assert(!config.includes("[[hooks."), "generated config should not install hooks");
assert(!config.includes("codex_hooks"), "generated config should not enable hook features");

const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");

const invalidArchive = runCliFail("src", ["archive", "--run", "../bad", "--target", tmp]);
assert(invalidArchive.includes("Invalid run id"), "archive should reject unsafe run ids");

runCli("src", ["archive", "--run", "smoke-run", "--target", tmp]);
assert(!fs.existsSync(runDir), "archive should move run out of runs/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "smoke-run")), "archive directory was not created");

const brainstormDir = path.join(tmp, ".agentflow", "brainstorm", "smoke-brainstorm");
fs.mkdirSync(brainstormDir, { recursive: true });
fs.writeFileSync(path.join(brainstormDir, "brief.md"), "Status: ready-for-plan\n", "utf8");

const invalidBrainstormArchive = runCliFail("src", ["archive", "--brainstorm", "../bad", "--target", tmp]);
assert(invalidBrainstormArchive.includes("Invalid brainstorm id"), "archive should reject unsafe brainstorm ids");

runCli("src", ["archive", "--brainstorm", "smoke-brainstorm", "--target", tmp]);
assert(!fs.existsSync(brainstormDir), "archive should move brainstorm out of brainstorm/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "brainstorm", "smoke-brainstorm")), "brainstorm archive directory was not created");

fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(
  path.join(tmp, ".agentflow", "state.json"),
  JSON.stringify(
    {
      version: 1,
      mode: "active",
      current_brainstorm: null,
      current_run: "smoke-run",
      current_phase: "executing",
      current_milestone: "smoke",
      blocked: false,
      updated_by: "smoke"
    },
    null,
    2
  )
);
runCli("src", ["doctor", "--target", tmp]);

console.log(`source workflow OK: ${tmp}`);
