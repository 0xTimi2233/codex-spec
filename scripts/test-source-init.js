import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, tempDir } from "./test-utils.js";

const tmp = tempDir("codex-spec-source-init-");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);

const defaultConfig = readText(tmp, ".codex", "config.toml");
const defaultState = readText(tmp, ".agentflow", "state.json");
const zhMainThread = readText(tmp, ".codex", "prompts", "main-thread.md");
const zhFileProtocol = readText(tmp, ".codex", "prompts", "file-protocol.md");
const zhSubagentContract = readText(tmp, ".codex", "prompts", "subagent-contract.md");
const zhBrainstormSkill = readText(tmp, ".agents", "skills", "brainstorm", "SKILL.md");
const zhPlanSkill = readText(tmp, ".agents", "skills", "plan", "SKILL.md");
const zhPmRole = readText(tmp, ".codex", "prompts", "roles", "pm.md");
const zhArchitectRole = readText(tmp, ".codex", "prompts", "roles", "architect.md");
const zhDocReviewerRole = readText(tmp, ".codex", "prompts", "roles", "doc-reviewer.md");
const zhCodeReviewerRole = readText(tmp, ".codex", "prompts", "roles", "code-reviewer.md");
assert(defaultConfig.includes('model = "gpt-5.5"'), "default model was not rendered");
assert(defaultConfig.includes('model_reasoning_effort = "xhigh"'), "main thread reasoning should be xhigh");
assert(!defaultConfig.includes("service_tier"), "fast mode should be off by default");
assert(defaultState.includes('"current_brainstorm": null'), "state should track current brainstorm");
assert(zhMainThread.includes("决策路由"), "zh main-thread should define decision routing");
assert(zhMainThread.includes("只有 PM 或 Architect"), "zh main-thread should limit user decision escalation");
assert(zhMainThread.includes("$brainstorm"), "zh main-thread should define brainstorm workflow");
assert(zhFileProtocol.includes("User decision required"), "zh file protocol should define decision request format");
assert(zhFileProtocol.includes(".agentflow/brainstorm/<brainstorm-id>/"), "zh file protocol should define brainstorm session path");
assert(zhFileProtocol.includes(".agentflow/archives/brainstorm/<brainstorm-id>/"), "zh file protocol should define brainstorm archive path");
assert(zhSubagentContract.includes("跨越当前角色边界"), "zh subagent contract should define decision request boundaries");
assert(zhBrainstormSkill.includes(".agentflow/state.json.current_brainstorm"), "zh brainstorm skill should track current brainstorm");
assert(zhBrainstormSkill.includes("上下文输入"), "zh brainstorm skill should use context input wording");
assert(zhBrainstormSkill.includes(".agentflow/brainstorm/<brainstorm-id>/brief.md"), "zh brainstorm skill should write brainstorm brief under its id");
assert(zhBrainstormSkill.includes("codex-spec archive --brainstorm <brainstorm-id>"), "zh brainstorm skill should archive completed brainstorms");
assert(!zhPlanSkill.includes("brainstorm/*/brief.md"), "zh plan skill should not use brainstorm glob paths");
assert(zhPlanSkill.includes("PM 决策处理"), "zh plan skill should handle PM decision requests");
assert(zhPlanSkill.includes("current_brainstorm"), "zh plan skill should close active brainstorm briefs");
assert(zhPlanSkill.includes("主线程指定的 brainstorm `brief.md` 路径"), "zh plan skill should use the specified brainstorm brief");
assert(zhPmRole.includes("2-4 个选项"), "zh PM role should request numbered options");
assert(zhArchitectRole.includes("Decision Request"), "zh Architect role should return decision requests");
assert(zhDocReviewerRole.includes("严格模式"), "zh Doc Reviewer role should enforce strict mode");
assert(zhCodeReviewerRole.includes("Developer 解释不能免除"), "zh Code Reviewer role should not accept developer rationale alone");
assert(fs.existsSync(path.join(tmp, ".agentflow", "brainstorm", ".gitkeep")), "brainstorm directory should be initialized");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "brainstorm", ".gitkeep")), "brainstorm archive directory should be initialized");
for (const removedSkill of ["doc-review", "code-review", "verify", "finish"]) {
  assert(!fs.existsSync(path.join(tmp, ".agents", "skills", removedSkill, "SKILL.md")), `${removedSkill} should not be a user-facing skill`);
}

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
const enSubagentContract = readText(highTmp, ".codex", "prompts", "subagent-contract.md");
const enBrainstormSkill = readText(highTmp, ".agents", "skills", "brainstorm", "SKILL.md");
const enPlanSkill = readText(highTmp, ".agents", "skills", "plan", "SKILL.md");
const enPmRole = readText(highTmp, ".codex", "prompts", "roles", "pm.md");
const enArchitectRole = readText(highTmp, ".codex", "prompts", "roles", "architect.md");
const enDocReviewerRole = readText(highTmp, ".codex", "prompts", "roles", "doc-reviewer.md");
const enCodeReviewerRole = readText(highTmp, ".codex", "prompts", "roles", "code-reviewer.md");

assert(highConfig.includes('service_tier = "fast"'), "fast mode was not rendered");
assert(pmAgent.includes('model_reasoning_effort = "xhigh"'), "pm xhigh override was not rendered");
assert(architectAgent.includes('model_reasoning_effort = "xhigh"'), "architect xhigh override was not rendered");
assert(developerAgent.includes('model = "gpt-5.5"'), "developer model should be explicit");
assert(developerAgent.includes('model_reasoning_effort = "high"'), "developer should use explicit high profile reasoning");
assert(enMainThread.includes("Decision Routing"), "en main-thread should define decision routing");
assert(enMainThread.includes("Only unresolved PM or Architect"), "en main-thread should limit user decision escalation");
assert(enMainThread.includes("$brainstorm"), "en main-thread should define brainstorm workflow");
assert(enFileProtocol.includes("User decision required"), "en file protocol should define decision request format");
assert(enFileProtocol.includes(".agentflow/brainstorm/<brainstorm-id>/"), "en file protocol should define brainstorm session path");
assert(enFileProtocol.includes(".agentflow/archives/brainstorm/<brainstorm-id>/"), "en file protocol should define brainstorm archive path");
assert(enSubagentContract.includes("crosses the current role boundary"), "en subagent contract should define decision request boundaries");
assert(enBrainstormSkill.includes(".agentflow/state.json.current_brainstorm"), "en brainstorm skill should track current brainstorm");
assert(enBrainstormSkill.includes("Context Inputs"), "en brainstorm skill should use context input wording");
assert(enBrainstormSkill.includes(".agentflow/brainstorm/<brainstorm-id>/brief.md"), "en brainstorm skill should write brainstorm brief under its id");
assert(enBrainstormSkill.includes("codex-spec archive --brainstorm <brainstorm-id>"), "en brainstorm skill should archive completed brainstorms");
assert(!enPlanSkill.includes("brainstorm/*/brief.md"), "en plan skill should not use brainstorm glob paths");
assert(enPlanSkill.includes("PM Decision Handling"), "en plan skill should handle PM decision requests");
assert(enPlanSkill.includes("current_brainstorm"), "en plan skill should close active brainstorm briefs");
assert(enPlanSkill.includes("specified `ready-for-plan` brainstorm brief"), "en plan skill should use the specified brainstorm brief");
assert(enPmRole.includes("2-4 options"), "en PM role should request numbered options");
assert(enArchitectRole.includes("Decision Request"), "en Architect role should return decision requests");
assert(enDocReviewerRole.includes("Strict mode"), "en Doc Reviewer role should enforce strict mode");
assert(enCodeReviewerRole.includes("Developer rationale does not waive"), "en Code Reviewer role should not accept developer rationale alone");
for (const removedSkill of ["doc-review", "code-review", "verify", "finish"]) {
  assert(!fs.existsSync(path.join(highTmp, ".agents", "skills", removedSkill, "SKILL.md")), `${removedSkill} should not be a user-facing skill`);
}

console.log(`source init OK: ${tmp}`);
