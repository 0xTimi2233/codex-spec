import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, runCliFail, tempDir } from "./test-utils.js";

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

console.log(`dist smoke OK: ${tmp}`);
