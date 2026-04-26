import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, tempDir } from "./test-utils.js";

const tmp = tempDir("codex-spec-source-init-");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);

const defaultConfig = readText(tmp, ".codex", "config.toml");
const zhAgents = readText(tmp, "AGENTS.md");
const zhMainThread = readText(tmp, ".codex", "prompts", "main-thread.md");
const zhSubagentContract = readText(tmp, ".codex", "prompts", "subagent-contract.md");
const zhPmAgent = readText(tmp, ".codex", "agents", "pm.toml");
assert(defaultConfig.includes('model = "gpt-5.5"'), "default model was not rendered");
assert(defaultConfig.includes('model_reasoning_effort = "xhigh"'), "main thread reasoning should be xhigh");
assert(!defaultConfig.includes("service_tier"), "fast mode should be off by default");
assert(zhAgents.includes("自然语言正文使用简体中文"), "zh AGENTS should define Chinese narrative language");
assert(zhMainThread.includes("dispatch 的字段名保持英文"), "zh main-thread prompt should define dispatch language policy");
assert(zhSubagentContract.includes("子代理回复主线程"), "zh subagent contract should define subagent language policy");
assert(zhPmAgent.includes("自然语言正文使用简体中文"), "zh agent config should define Chinese narrative language");

runCli("src", ["--version"]);
runCli("src", ["doctor", "--target", tmp]);
runCli("src", ["status", "--target", tmp]);

const customAgents = "# Custom agents\n";
const customVision = "# Custom vision\n";
fs.writeFileSync(path.join(tmp, "AGENTS.md"), customAgents, "utf8");
fs.writeFileSync(path.join(tmp, "agentflow", "vision.md"), customVision, "utf8");

runCli("src", ["init", "--lang", "zh", "--target", tmp]);
assert(readText(tmp, "AGENTS.md") === customAgents, "init should preserve existing generated files by default");
assert(readText(tmp, "agentflow", "vision.md") === customVision, "init should preserve existing agentflow files by default");

runCli("src", ["init", "--lang", "zh", "--force", "--target", tmp]);
assert(readText(tmp, "AGENTS.md") !== customAgents, "--force should overwrite existing non-agentflow generated files");
assert(readText(tmp, "agentflow", "vision.md") === customVision, "--force should not overwrite existing agentflow files");

const highTmp = tempDir("codex-spec-source-high-");
runCli("src", ["init", "--lang", "en", "--model", "high", "--fast", "on", "--target", highTmp]);

const highConfig = readText(highTmp, ".codex", "config.toml");
const pmAgent = readText(highTmp, ".codex", "agents", "pm.toml");
const architectAgent = readText(highTmp, ".codex", "agents", "architect.toml");
const developerAgent = readText(highTmp, ".codex", "agents", "developer.toml");

assert(highConfig.includes('service_tier = "fast"'), "fast mode was not rendered");
assert(pmAgent.includes('model_reasoning_effort = "xhigh"'), "pm xhigh override was not rendered");
assert(architectAgent.includes('model_reasoning_effort = "xhigh"'), "architect xhigh override was not rendered");
assert(developerAgent.includes('model = "gpt-5.5"'), "developer model should be explicit");
assert(developerAgent.includes('model_reasoning_effort = "high"'), "developer should use explicit high profile reasoning");

console.log(`source init OK: ${tmp}`);
