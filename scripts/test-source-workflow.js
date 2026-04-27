import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, runCliFail, runInternal, runInternalFail, tempDir } from "./test-utils.js";

function writeState(root, state) {
  fs.writeFileSync(path.join(root, ".agentflow", "state.json"), JSON.stringify(state, null, 2), "utf8");
}

const tmp = tempDir("codex-spec-source-workflow-");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);

const config = readText(tmp, ".codex", "config.toml");
assert(!config.includes("[[hooks."), "generated config should not install hooks");
assert(!config.includes("codex_hooks"), "generated config should not enable hook features");

const missingPlanningTrack = runInternalFail("src", ["state", "set", "--planning-session", "orphan", "--target", tmp]);
assert(missingPlanningTrack.includes("--planning-session and --planning-track must be set or cleared together"), "state should reject planning session without track");

const missingPlanningSession = runInternalFail("src", ["state", "set", "--planning-track", "explore", "--target", tmp]);
assert(missingPlanningSession.includes("--planning-session and --planning-track must be set or cleared together"), "state should reject planning track without session");

runInternal("src", ["state", "set", "--planning-session", "paired-explore", "--planning-track", "explore", "--target", tmp]);
let pairedState = JSON.parse(readText(tmp, ".agentflow", "state.json"));
assert(pairedState.current_planning_session === "paired-explore", "state should accept paired planning session");
assert(pairedState.planning_track === "explore", "state should accept paired planning track");

const clearingOnlySession = runInternalFail("src", ["state", "set", "--planning-session", "null", "--target", tmp]);
assert(clearingOnlySession.includes("--planning-session and --planning-track must be set or cleared together"), "state should reject clearing only planning session");

runInternal("src", ["state", "set", "--planning-session", "null", "--planning-track", "null", "--target", tmp]);
pairedState = JSON.parse(readText(tmp, ".agentflow", "state.json"));
assert(pairedState.current_planning_session === null, "state should clear paired planning session");
assert(pairedState.planning_track === null, "state should clear paired planning track");

const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
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

const invalidArchive = runInternalFail("src", ["archive", "--run", "../bad", "--target", tmp]);
assert(invalidArchive.includes("Invalid run id"), "archive should reject unsafe run ids");

runInternal("src", ["archive", "--run", "smoke-run", "--target", tmp]);
assert(!fs.existsSync(runDir), "archive should move run out of runs/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "smoke-run")), "archive directory was not created");
const stateAfterRunArchive = JSON.parse(readText(tmp, ".agentflow", "state.json"));
assert(stateAfterRunArchive.current_run === "smoke-run", "archive should not clear current run");
assert(stateAfterRunArchive.current_phase === "finishing", "archive should not reset phase");

const exploreDir = path.join(tmp, ".agentflow", "explore", "smoke-explore");
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

const invalidExploreArchive = runInternalFail("src", ["archive", "--explore", "../bad", "--target", tmp]);
assert(invalidExploreArchive.includes("Invalid explore id"), "archive should reject unsafe explore ids");

runInternal("src", ["archive", "--explore", "smoke-explore", "--target", tmp]);
assert(!fs.existsSync(exploreDir), "archive should move explore out of explore/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "explore", "smoke-explore")), "explore archive directory was not created");
const stateAfterExploreArchive = JSON.parse(readText(tmp, ".agentflow", "state.json"));
assert(stateAfterExploreArchive.current_planning_session === "smoke-explore", "archive should not clear current planning session");
assert(stateAfterExploreArchive.planning_track === "explore", "archive should not clear planning track");

const preflightDir = path.join(tmp, ".agentflow", "preflight", "smoke-preflight");
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

const invalidPreflightArchive = runInternalFail("src", ["archive", "--preflight", "../bad", "--target", tmp]);
assert(invalidPreflightArchive.includes("Invalid preflight id"), "archive should reject unsafe preflight ids");

runInternal("src", ["archive", "--preflight", "smoke-preflight", "--target", tmp]);
assert(!fs.existsSync(preflightDir), "archive should move preflight out of preflight/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "preflight", "smoke-preflight")), "preflight archive directory was not created");
const stateAfterPreflightArchive = JSON.parse(readText(tmp, ".agentflow", "state.json"));
assert(stateAfterPreflightArchive.current_planning_session === "smoke-preflight", "archive should not clear current planning session when archiving preflight");
assert(stateAfterPreflightArchive.planning_track === "preflight", "archive should not clear planning track when archiving preflight");

fs.mkdirSync(runDir, { recursive: true });
writeState(tmp, {
  version: 1,
  current_planning_session: null,
  planning_track: null,
  current_run: "smoke-run",
  current_phase: "executing",
  current_milestone: "smoke",
  blocked: false,
  updated_by: "smoke"
});
const stateRunDir = path.join(tmp, ".agentflow", "runs", "state-run");
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
runInternal("src", ["archive", "--target", tmp]);
assert(!fs.existsSync(stateRunDir), "archive should use current run when --run is omitted");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "state-run")), "state run archive directory was not created");
assert(JSON.parse(readText(tmp, ".agentflow", "state.json")).current_run === "state-run", "archive without --run should not clear current run");

runCli("src", ["doctor", "--target", tmp]);

console.log(`source workflow OK: ${tmp}`);
