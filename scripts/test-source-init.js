import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, tempDir } from "./test-utils.js";

const tmp = tempDir("codex-spec-source-init-");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);

const defaultConfig = readText(tmp, ".codex", "config.toml");
const zhMainThread = readText(tmp, ".codex", "prompts", "main-thread.md");
const zhFileProtocol = readText(tmp, ".codex", "prompts", "file-protocol.md");
const zhPlanSkill = readText(tmp, ".agents", "skills", "plan", "SKILL.md");
const zhPmRole = readText(tmp, ".codex", "prompts", "roles", "pm.md");
assert(defaultConfig.includes('model = "gpt-5.5"'), "default model was not rendered");
assert(defaultConfig.includes('model_reasoning_effort = "xhigh"'), "main thread reasoning should be xhigh");
assert(!defaultConfig.includes("service_tier"), "fast mode should be off by default");
assert(zhMainThread.includes("用户决策 Gate"), "zh main-thread should define user decision gate");
assert(zhFileProtocol.includes("User decision required"), "zh file protocol should define decision request format");
assert(zhPlanSkill.includes("PM 决策处理"), "zh plan skill should handle PM decision requests");
assert(zhPmRole.includes("2-4 个选项"), "zh PM role should request numbered options");

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
const enMainThread = readText(highTmp, ".codex", "prompts", "main-thread.md");
const enFileProtocol = readText(highTmp, ".codex", "prompts", "file-protocol.md");
const enPlanSkill = readText(highTmp, ".agents", "skills", "plan", "SKILL.md");
const enPmRole = readText(highTmp, ".codex", "prompts", "roles", "pm.md");

assert(highConfig.includes('service_tier = "fast"'), "fast mode was not rendered");
assert(pmAgent.includes('model_reasoning_effort = "xhigh"'), "pm xhigh override was not rendered");
assert(architectAgent.includes('model_reasoning_effort = "xhigh"'), "architect xhigh override was not rendered");
assert(developerAgent.includes('model = "gpt-5.5"'), "developer model should be explicit");
assert(developerAgent.includes('model_reasoning_effort = "high"'), "developer should use explicit high profile reasoning");
assert(enMainThread.includes("User Decision Gate"), "en main-thread should define user decision gate");
assert(enFileProtocol.includes("User decision required"), "en file protocol should define decision request format");
assert(enPlanSkill.includes("PM Decision Handling"), "en plan skill should handle PM decision requests");
assert(enPmRole.includes("2-4 options"), "en PM role should request numbered options");

console.log(`source init OK: ${tmp}`);
