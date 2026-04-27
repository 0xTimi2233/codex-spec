import fs from "node:fs";
import path from "node:path";
import { assert, readText, root, runCli, runCliFail, runInternal, runInternalFail, tempDir } from "./test-utils.js";

const WINDOWS_UNSAFE_PATH_CHARS = /[<>:"\\|?*]/;

function generatedFiles(rootDir, relDir = ".") {
  const dir = path.join(rootDir, relDir);
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(relDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...generatedFiles(rootDir, rel));
    } else {
      out.push(rel);
    }
  }
  return out;
}

function assertNoWindowsUnsafePaths(rootDir) {
  for (const rel of generatedFiles(rootDir)) {
    assert(!WINDOWS_UNSAFE_PATH_CHARS.test(rel), `dist init should not install Windows-unsafe path: ${rel}`);
  }
}

function writeState(rootDir, state) {
  fs.writeFileSync(path.join(rootDir, "codexspec/runtime", "state.json"), JSON.stringify(state, null, 2), "utf8");
}

const tmp = tempDir("codex-spec-dist-");
runCli("dist", ["init", "--lang", "en", "--model", "xhigh", "--fast", "off", "--target", tmp]);
assertNoWindowsUnsafePaths(tmp);

const config = readText(tmp, ".codex", "config.toml");
const developerAgent = readText(tmp, ".codex", "agents", "developer.toml");
const docReviewerAgent = readText(tmp, ".codex", "agents", "doc-reviewer.toml");
assert(config.includes('model = "gpt-5.5"'), "model was not rendered");
assert(config.includes('model_reasoning_effort = "xhigh"'), "xhigh profile was not rendered");
assert(config.includes('sandbox_mode = "workspace-write"'), "root config should declare sandbox mode");
assert(config.includes('approval_policy = "on-request"'), "root config should declare approval policy");
assert(!config.includes("service_tier"), "fast mode off should not render service_tier");
assert(!config.includes("[[hooks."), "generated config should not install hooks");
assert(!config.includes("codex_hooks"), "generated config should not enable hook features");
assert(config.includes('[agents.developer]'), "config should declare developer role");
assert(config.includes('config_file = ".codex/agents/developer.toml"'), "config should point developer at its role config layer");
assert(config.includes('nickname_candidates = ["Developer", "Builder", "Implementer"]'), "developer should declare nickname candidates");
assert(developerAgent.includes('name = "developer"'), "developer agent should keep its role name");
assert(developerAgent.includes('description = "Implements code and test code from dispatch-listed authoritative docs and file scope."'), "developer agent should keep its description");
assert(developerAgent.includes('model = "gpt-5.5"'), "developer model should be explicit");
assert(developerAgent.includes('model_reasoning_effort = "xhigh"'), "xhigh profile should render xhigh agent reasoning");
assert(developerAgent.includes('sandbox_mode = "workspace-write"'), "developer should declare workspace-write sandbox");
assert(developerAgent.includes('approval_policy = "on-request"'), "developer should declare approval policy");
assert(developerAgent.includes("Responsibilities:") && developerAgent.includes("Boundaries:"), "developer should define responsibilities and boundaries");
assert(!developerAgent.includes("default_permissions"), "developer should not declare permission profiles");
assert(!developerAgent.includes("[permissions."), "developer should not declare filesystem permissions");
assert(docReviewerAgent.includes('name = "doc-reviewer"'), "doc reviewer agent should keep its role name");
assert(docReviewerAgent.includes('sandbox_mode = "workspace-write"'), "doc reviewer should declare workspace-write sandbox");
assert(docReviewerAgent.includes('approval_policy = "on-request"'), "doc reviewer should declare approval policy");
assert(docReviewerAgent.includes("Do not dispatch other roles"), "doc reviewer should define routing boundary");
assert(!docReviewerAgent.includes("default_permissions"), "doc reviewer should not declare permission profiles");
assert(!docReviewerAgent.includes("[permissions."), "doc reviewer should not declare filesystem permissions");
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
assert(fs.existsSync(path.join(tmp, ".agents", "skills", "plan", "SKILL.md")), "dist init should include plan skill");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "brainstorm", "SKILL.md")), "dist init should not include brainstorm skill");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "preflight", "SKILL.md")), "dist init should not include preflight skill");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "brainstorm")), "dist init should not include brainstorm directory");
assert(!fs.existsSync(path.join(tmp, ".agents", "skills", "preflight")), "dist init should not include preflight directory");
for (const removedSkill of ["brainstorm", "preflight", "doc-review", "code-review", "verify", "finish"]) {
  assert(!fs.existsSync(path.join(tmp, ".agents", "skills", removedSkill, "SKILL.md")), `${removedSkill} should not be installed as a user-facing skill`);
  assert(!fs.existsSync(path.join(tmp, ".agents", "skills", removedSkill)), `${removedSkill} skill directory should not be installed`);
}

runCli("dist", ["--version"]);
runCli("dist", ["doctor", "--target", tmp]);
assert(fs.existsSync(path.join(root, "dist", "internal.js")), "dist should include internal script entrypoint");
assert(runCliFail("dist", ["status", "--target", tmp]).includes("Unknown command"), "public dist cli should reject status");
assert(runCliFail("dist", ["state", "set", "--target", tmp]).includes("Unknown command"), "public dist cli should reject state");
assert(runCliFail("dist", ["archive", "--target", tmp]).includes("Unknown command"), "public dist cli should reject archive");
runInternal("dist", ["status", "--target", tmp]);

const runDir = path.join(tmp, "codexspec/runtime", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");
writeState(tmp, {
  version: 1,
  current_planning_session: null,
  planning_track: null,
  current_run: "smoke-run",
  current_phase: "finishing",
  current_milestone: "smoke",
  blocked: false,
  updated_by: "smoke"
});

const invalidArchive = runInternalFail("dist", ["archive", "--run", "../bad", "--target", tmp]);
assert(invalidArchive.includes("Invalid run id"), "archive should reject unsafe run ids");

runInternal("dist", ["archive", "--run", "smoke-run", "--target", tmp]);
assert(!fs.existsSync(runDir), "archive should move run out of runs/");
assert(fs.existsSync(path.join(tmp, "codexspec/runtime", "archives", "runs", "smoke-run")), "archive directory was not created");
assert(JSON.parse(readText(tmp, "codexspec/runtime", "state.json")).current_run === "smoke-run", "archive should not clear current run");

const stateRunDir = path.join(tmp, "codexspec/runtime", "runs", "state-run");
fs.mkdirSync(stateRunDir, { recursive: true });
writeState(tmp, {
  version: 1,
  current_planning_session: null,
  planning_track: null,
  current_run: "state-run",
  current_phase: "finishing",
  current_milestone: "smoke",
  blocked: false,
  updated_by: "smoke"
});
runInternal("dist", ["archive", "--target", tmp]);
assert(!fs.existsSync(stateRunDir), "archive should use current run when --run is omitted");
assert(fs.existsSync(path.join(tmp, "codexspec/runtime", "archives", "runs", "state-run")), "state run archive directory was not created");
assert(JSON.parse(readText(tmp, "codexspec/runtime", "state.json")).current_run === "state-run", "archive without --run should not clear current run");

const exploreDir = path.join(tmp, "codexspec/runtime", "explore", "smoke-explore");
fs.mkdirSync(exploreDir, { recursive: true });
fs.writeFileSync(path.join(exploreDir, "brief.md"), "Status: ready-for-plan\n", "utf8");
writeState(tmp, {
  version: 1,
  current_planning_session: "smoke-explore",
  planning_track: "explore",
  current_run: null,
  current_phase: "idle",
  current_milestone: null,
  blocked: false,
  updated_by: "smoke"
});

runInternal("dist", ["archive", "--explore", "smoke-explore", "--target", tmp]);
assert(!fs.existsSync(exploreDir), "archive should move explore out of explore/");
assert(fs.existsSync(path.join(tmp, "codexspec/runtime", "archives", "explore", "smoke-explore")), "explore archive directory was not created");
assert(JSON.parse(readText(tmp, "codexspec/runtime", "state.json")).current_planning_session === "smoke-explore", "archive should not clear current planning session");

const preflightDir = path.join(tmp, "codexspec/runtime", "preflight", "smoke-preflight");
fs.mkdirSync(preflightDir, { recursive: true });
fs.writeFileSync(path.join(preflightDir, "brief.md"), "Status: ready-for-plan\n", "utf8");
writeState(tmp, {
  version: 1,
  current_planning_session: "smoke-preflight",
  planning_track: "preflight",
  current_run: null,
  current_phase: "idle",
  current_milestone: null,
  blocked: false,
  updated_by: "smoke"
});

runInternal("dist", ["archive", "--preflight", "smoke-preflight", "--target", tmp]);
assert(!fs.existsSync(preflightDir), "archive should move preflight out of preflight/");
assert(fs.existsSync(path.join(tmp, "codexspec/runtime", "archives", "preflight", "smoke-preflight")), "preflight archive directory was not created");
const stateAfterPreflight = JSON.parse(readText(tmp, "codexspec/runtime", "state.json"));
assert(stateAfterPreflight.current_planning_session === "smoke-preflight", "archive should not clear current planning session after preflight");
assert(stateAfterPreflight.planning_track === "preflight", "archive should not clear planning track after preflight");

console.log(`dist smoke OK: ${tmp}`);
