import fs from "node:fs";
import path from "node:path";
import { assert, readText, root, runCli, runCliFail, tempDir } from "./test-utils.js";

function writeState(rootDir, state) {
  fs.writeFileSync(path.join(rootDir, ".agentflow", "state.json"), JSON.stringify(state, null, 2), "utf8");
}

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
assert(fs.existsSync(path.join(tmp, ".agents", "skills", "spec:plan", "SKILL.md")), "dist init should include spec:plan skill");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "spec:brainstorm", "SKILL.md")), "dist init should not include spec:brainstorm skill");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "spec:preflight", "SKILL.md")), "dist init should not include spec:preflight skill");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "spec:brainstorm")), "dist init should not include spec:brainstorm directory");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "spec:preflight")), "dist init should not include spec:preflight directory");
for (const removedSkill of ["brainstorm", "preflight", "plan", "design", "execute", "auto", "status", "resume", "doc-review", "code-review", "verify", "finish"]) {
  assert(!fs.existsSync(path.join(tmp, ".agents", "skills", removedSkill, "SKILL.md")), `${removedSkill} should not be installed as a user-facing skill`);
  assert(!fs.existsSync(path.join(tmp, ".agents", "skills", removedSkill)), `${removedSkill} skill directory should not be installed`);
}

runCli("dist", ["--version"]);
runCli("dist", ["doctor", "--target", tmp]);
runCli("dist", ["status", "--target", tmp]);

const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");
writeState(tmp, {
  version: 1,
  mode: "active",
  current_planning_session: null,
  planning_track: null,
  current_run: "smoke-run",
  current_phase: "finishing",
  current_milestone: "smoke",
  blocked: false,
  updated_by: "smoke"
});

const invalidArchive = runCliFail("dist", ["archive", "--run", "../bad", "--target", tmp]);
assert(invalidArchive.includes("Invalid run id"), "archive should reject unsafe run ids");

runCli("dist", ["archive", "--run", "smoke-run", "--target", tmp]);
assert(!fs.existsSync(runDir), "archive should move run out of runs/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "smoke-run")), "archive directory was not created");
assert(JSON.parse(readText(tmp, ".agentflow", "state.json")).current_run === null, "archive should clear current run");

const exploreDir = path.join(tmp, ".agentflow", "explore", "smoke-explore");
fs.mkdirSync(exploreDir, { recursive: true });
fs.writeFileSync(path.join(exploreDir, "brief.md"), "Status: ready-for-plan\n", "utf8");
writeState(tmp, {
  version: 1,
  mode: "idle",
  current_planning_session: "smoke-explore",
  planning_track: "explore",
  current_run: null,
  current_phase: "idle",
  current_milestone: null,
  blocked: false,
  updated_by: "smoke"
});

runCli("dist", ["archive", "--explore", "smoke-explore", "--target", tmp]);
assert(!fs.existsSync(exploreDir), "archive should move explore out of explore/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "explore", "smoke-explore")), "explore archive directory was not created");
assert(JSON.parse(readText(tmp, ".agentflow", "state.json")).current_planning_session === null, "archive should clear current planning session");

const preflightDir = path.join(tmp, ".agentflow", "preflight", "smoke-preflight");
fs.mkdirSync(preflightDir, { recursive: true });
fs.writeFileSync(path.join(preflightDir, "brief.md"), "Status: ready-for-plan\n", "utf8");
writeState(tmp, {
  version: 1,
  mode: "idle",
  current_planning_session: "smoke-preflight",
  planning_track: "preflight",
  current_run: null,
  current_phase: "idle",
  current_milestone: null,
  blocked: false,
  updated_by: "smoke"
});

runCli("dist", ["archive", "--preflight", "smoke-preflight", "--target", tmp]);
assert(!fs.existsSync(preflightDir), "archive should move preflight out of preflight/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "preflight", "smoke-preflight")), "preflight archive directory was not created");
const stateAfterPreflight = JSON.parse(readText(tmp, ".agentflow", "state.json"));
assert(stateAfterPreflight.current_planning_session === null, "archive should clear current planning session after preflight");
assert(stateAfterPreflight.planning_track === null, "archive should clear planning track after preflight");

console.log(`dist smoke OK: ${tmp}`);
