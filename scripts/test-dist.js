import fs from "node:fs";
import path from "node:path";
import { assert, readText, root, runCli, runCliFail, tempDir } from "./test-utils.js";

const tmp = tempDir("codex-spec-dist-");
runCli("dist", ["init", "--lang", "en", "--model", "xhigh", "--fast", "off", "--target", tmp]);

const config = readText(tmp, ".codex", "config.toml");
const developerAgent = readText(tmp, ".codex", "agents", "developer.toml");
assert(config.includes('model = "gpt-5.5"'), "model was not rendered");
assert(config.includes('model_reasoning_effort = "xhigh"'), "xhigh profile was not rendered");
assert(!config.includes("service_tier"), "fast mode off should not render service_tier");
assert(!config.includes("[[hooks."), "generated config should not install hooks");
assert(!config.includes("codex_hooks"), "generated config should not enable hook features");
assert(developerAgent.includes('model = "gpt-5.5"'), "developer model should be explicit");
assert(developerAgent.includes('model_reasoning_effort = "xhigh"'), "xhigh profile should render xhigh agent reasoning");
assert(!developerAgent.includes("service_tier"), "fast mode off should not render agent service_tier");
runCli("dist", ["profile", "--model", "high", "--fast", "on", "--target", tmp]);
const profiledConfig = readText(tmp, ".codex", "config.toml");
const profiledPmAgent = readText(tmp, ".codex", "agents", "pm.toml");
const profiledDeveloperAgent = readText(tmp, ".codex", "agents", "developer.toml");
assert(profiledConfig.includes('service_tier = "fast"'), "profile should enable root fast mode");
assert(profiledPmAgent.includes('model_reasoning_effort = "xhigh"'), "profile high should keep pm xhigh");
assert(profiledPmAgent.includes('service_tier = "fast"'), "profile should enable pm fast mode");
assert(profiledDeveloperAgent.includes('model_reasoning_effort = "high"'), "profile high should set developer high");
assert(profiledDeveloperAgent.includes('service_tier = "fast"'), "profile should enable developer fast mode");
assert(!fs.existsSync(path.join(root, "dist", "hooks")), "dist should not include hooks");
assert(fs.existsSync(path.join(tmp, ".agents", "skills", "brainstorm", "SKILL.md")), "dist init should include brainstorm skill");
for (const removedSkill of ["doc-review", "code-review", "verify", "finish"]) {
  assert(!fs.existsSync(path.join(tmp, ".agents", "skills", removedSkill, "SKILL.md")), `${removedSkill} should not be installed as a user-facing skill`);
}

runCli("dist", ["--version"]);
runCli("dist", ["doctor", "--target", tmp]);
runCli("dist", ["status", "--target", tmp]);

const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");
fs.writeFileSync(
  path.join(tmp, ".agentflow", "state.json"),
  JSON.stringify(
    {
      version: 1,
      mode: "active",
      current_brainstorm: null,
      current_run: "smoke-run",
      current_phase: "finishing",
      current_milestone: "smoke",
      blocked: false,
      updated_by: "smoke"
    },
    null,
    2
  )
);

const invalidArchive = runCliFail("dist", ["archive", "--run", "../bad", "--target", tmp]);
assert(invalidArchive.includes("Invalid run id"), "archive should reject unsafe run ids");

runCli("dist", ["archive", "--run", "smoke-run", "--target", tmp]);
assert(!fs.existsSync(runDir), "archive should move run out of runs/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "smoke-run")), "archive directory was not created");
assert(JSON.parse(readText(tmp, ".agentflow", "state.json")).current_run === null, "archive should clear current run");

const brainstormDir = path.join(tmp, ".agentflow", "brainstorm", "smoke-brainstorm");
fs.mkdirSync(brainstormDir, { recursive: true });
fs.writeFileSync(path.join(brainstormDir, "brief.md"), "Status: ready-for-plan\n", "utf8");
fs.writeFileSync(
  path.join(tmp, ".agentflow", "state.json"),
  JSON.stringify(
    {
      version: 1,
      mode: "idle",
      current_brainstorm: "smoke-brainstorm",
      current_run: null,
      current_phase: "idle",
      current_milestone: null,
      blocked: false,
      updated_by: "smoke"
    },
    null,
    2
  )
);

runCli("dist", ["archive", "--brainstorm", "smoke-brainstorm", "--target", tmp]);
assert(!fs.existsSync(brainstormDir), "archive should move brainstorm out of brainstorm/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "brainstorm", "smoke-brainstorm")), "brainstorm archive directory was not created");
assert(JSON.parse(readText(tmp, ".agentflow", "state.json")).current_brainstorm === null, "archive should clear current brainstorm");

console.log(`dist smoke OK: ${tmp}`);
