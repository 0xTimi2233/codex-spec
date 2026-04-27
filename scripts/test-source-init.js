import fs from "node:fs";
import path from "node:path";
import { assert, readText, runCli, tempDir } from "./test-utils.js";

const LEGACY_WORKFLOW_SKILL = /\$(brainstorm|plan|design|execute|auto|resume|status)\b/;

function generatedFiles(root, relDir) {
  const dir = path.join(root, relDir);
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(relDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...generatedFiles(root, rel));
    } else {
      out.push(rel);
    }
  }
  return out;
}

function assertNoLegacyWorkflowSkills(root, label) {
  for (const rel of [...generatedFiles(root, ".agents"), ...generatedFiles(root, ".codex")]) {
    const content = readText(root, rel);
    assert(!LEGACY_WORKFLOW_SKILL.test(content), `${label} should not reference legacy workflow skill in ${rel}`);
  }
}

const tmp = tempDir("codex-spec-source-init-");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);
assertNoLegacyWorkflowSkills(tmp, "zh init");

const defaultConfig = readText(tmp, ".codex", "config.toml");
const defaultState = readText(tmp, ".agentflow", "state.json");
const zhPmAgent = readText(tmp, ".codex", "agents", "pm.toml");
const zhArchitectAgent = readText(tmp, ".codex", "agents", "architect.toml");
const zhTesterAgent = readText(tmp, ".codex", "agents", "tester.toml");
const zhMainThread = readText(tmp, ".codex", "prompts", "main-thread.md");
const zhFileProtocol = readText(tmp, ".codex", "prompts", "file-protocol.md");
const zhSubagentContract = readText(tmp, ".codex", "prompts", "subagent-contract.md");
const zhBrainstormSkill = readText(tmp, ".agents", "skills", "spec:brainstorm", "SKILL.md");
const zhPlanSkill = readText(tmp, ".agents", "skills", "spec:plan", "SKILL.md");
const zhResumeSkill = readText(tmp, ".agents", "skills", "spec:resume", "SKILL.md");
const zhStatusSkill = readText(tmp, ".agents", "skills", "spec:status", "SKILL.md");
const zhPmRole = readText(tmp, ".codex", "prompts", "roles", "pm.md");
const zhArchitectRole = readText(tmp, ".codex", "prompts", "roles", "architect.md");
const zhDocReviewerRole = readText(tmp, ".codex", "prompts", "roles", "doc-reviewer.md");
const zhCodeReviewerRole = readText(tmp, ".codex", "prompts", "roles", "code-reviewer.md");
assert(defaultConfig.includes('model = "gpt-5.5"'), "default model was not rendered");
assert(defaultConfig.includes('model_reasoning_effort = "xhigh"'), "main thread reasoning should be xhigh");
assert(!defaultConfig.includes("service_tier"), "fast mode should be off by default");
assert(!zhPmAgent.includes("service_tier"), "fast mode off should not render agent service_tier");
assert(defaultState.includes('"current_brainstorm": null'), "state should track current brainstorm");
assert(zhMainThread.includes("决策路由"), "zh main-thread should define decision routing");
assert(zhMainThread.includes("只有 PM 或 Architect"), "zh main-thread should limit user decision escalation");
assert(zhMainThread.includes("$spec:brainstorm"), "zh main-thread should define brainstorm workflow");
assert(zhFileProtocol.includes("User decision required"), "zh file protocol should define decision request format");
assert(zhFileProtocol.includes(".agentflow/brainstorm/<brainstorm-id>/"), "zh file protocol should define brainstorm session path");
assert(zhFileProtocol.includes("rounds/"), "zh file protocol should define brainstorm rounds");
assert(zhFileProtocol.includes("round-001"), "zh file protocol should show append-only round directories");
assert(!zhFileProtocol.includes("questions.md"), "zh file protocol should not use the old shared questions file");
assert(zhFileProtocol.includes(".agentflow/archives/brainstorm/<brainstorm-id>/"), "zh file protocol should define brainstorm archive path");
assert(zhFileProtocol.includes("src/example-feature/**"), "zh gate example should be feature-scoped");
assert(!zhFileProtocol.includes("src/**"), "zh gate example should not use repo-wide source scope");
assert(zhSubagentContract.includes("跨越当前角色边界"), "zh subagent contract should define decision request boundaries");
assert(zhSubagentContract.includes("Inputs read"), "zh subagent contract should require standard report inputs");
assert(!zhSubagentContract.includes("Files written:"), "zh subagent contract should not use legacy report fields");
assert(zhPmAgent.includes("标准报告格式"), "zh pm agent should use standard report format");
assert(!zhPmAgent.includes("$finish"), "zh pm agent should not reference removed finish skill");
assert(!zhArchitectAgent.includes("$finish"), "zh architect agent should not reference removed finish skill");
assert(!zhTesterAgent.includes("$finish"), "zh tester agent should not reference removed finish skill");
assert(zhBrainstormSkill.includes(".agentflow/state.json.current_brainstorm"), "zh brainstorm skill should track current brainstorm");
assert(zhBrainstormSkill.includes("上下文输入"), "zh brainstorm skill should use context input wording");
assert(zhBrainstormSkill.includes(".agentflow/brainstorm/<brainstorm-id>/brief.md"), "zh brainstorm skill should write brainstorm brief under its id");
assert(zhBrainstormSkill.includes("rounds/round-<nnn>/round.md"), "zh brainstorm skill should write round files");
assert(zhBrainstormSkill.includes("codex-spec archive --brainstorm <brainstorm-id>"), "zh brainstorm skill should archive completed brainstorms");
assert(zhBrainstormSkill.includes(".agentflow/archives/brainstorm/<brainstorm-id>/brief.md"), "zh brainstorm skill should point to archived planning brief");
assert(zhBrainstormSkill.includes("每轮最多提出 1-3 个阻塞问题"), "zh brainstorm skill should limit question rounds");
assert(zhBrainstormSkill.includes("编号选项"), "zh brainstorm skill should ask with options");
assert(!zhPlanSkill.includes("brainstorm/*/brief.md"), "zh plan skill should not use brainstorm glob paths");
assert(zhPlanSkill.includes("PM 决策处理"), "zh plan skill should handle PM decision requests");
assert(zhPlanSkill.includes("current_brainstorm"), "zh plan skill should close active brainstorm briefs");
assert(zhPlanSkill.includes("主线程指定的 brainstorm `brief.md` 路径"), "zh plan skill should use the specified brainstorm brief");
assert(zhPlanSkill.includes(".agentflow/archives/brainstorm/<brainstorm-id>/brief.md"), "zh plan skill should use archived brainstorm briefs");
assert(zhResumeSkill.includes("current_brainstorm"), "zh resume skill should restore active brainstorms");
assert(zhStatusSkill.includes("brainstorm id"), "zh status skill should report brainstorm id");
assert(zhPmRole.includes("2-4 个选项"), "zh PM role should request numbered options");
assert(zhArchitectRole.includes("Decision Request"), "zh Architect role should return decision requests");
assert(zhDocReviewerRole.includes("严格模式"), "zh Doc Reviewer role should enforce strict mode");
assert(zhCodeReviewerRole.includes("Developer 解释不能免除"), "zh Code Reviewer role should not accept developer rationale alone");
assert(fs.existsSync(path.join(tmp, ".agentflow", "brainstorm", ".gitkeep")), "brainstorm directory should be initialized");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "brainstorm", ".gitkeep")), "brainstorm archive directory should be initialized");
for (const removedSkill of ["brainstorm", "plan", "design", "execute", "auto", "status", "resume", "doc-review", "code-review", "verify", "finish"]) {
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
assertNoLegacyWorkflowSkills(highTmp, "en init");

const highConfig = readText(highTmp, ".codex", "config.toml");
const pmAgent = readText(highTmp, ".codex", "agents", "pm.toml");
const architectAgent = readText(highTmp, ".codex", "agents", "architect.toml");
const testerAgent = readText(highTmp, ".codex", "agents", "tester.toml");
const developerAgent = readText(highTmp, ".codex", "agents", "developer.toml");
const enMainThread = readText(highTmp, ".codex", "prompts", "main-thread.md");
const enFileProtocol = readText(highTmp, ".codex", "prompts", "file-protocol.md");
const enSubagentContract = readText(highTmp, ".codex", "prompts", "subagent-contract.md");
const enBrainstormSkill = readText(highTmp, ".agents", "skills", "spec:brainstorm", "SKILL.md");
const enPlanSkill = readText(highTmp, ".agents", "skills", "spec:plan", "SKILL.md");
const enResumeSkill = readText(highTmp, ".agents", "skills", "spec:resume", "SKILL.md");
const enStatusSkill = readText(highTmp, ".agents", "skills", "spec:status", "SKILL.md");
const enPmRole = readText(highTmp, ".codex", "prompts", "roles", "pm.md");
const enArchitectRole = readText(highTmp, ".codex", "prompts", "roles", "architect.md");
const enDocReviewerRole = readText(highTmp, ".codex", "prompts", "roles", "doc-reviewer.md");
const enCodeReviewerRole = readText(highTmp, ".codex", "prompts", "roles", "code-reviewer.md");

assert(highConfig.includes('service_tier = "fast"'), "fast mode was not rendered");
assert(pmAgent.includes('model_reasoning_effort = "xhigh"'), "pm xhigh override was not rendered");
assert(pmAgent.includes('service_tier = "fast"'), "fast mode should render pm service_tier");
assert(architectAgent.includes('model_reasoning_effort = "xhigh"'), "architect xhigh override was not rendered");
assert(developerAgent.includes('model = "gpt-5.5"'), "developer model should be explicit");
assert(developerAgent.includes('model_reasoning_effort = "high"'), "developer should use explicit high profile reasoning");
assert(developerAgent.includes('service_tier = "fast"'), "fast mode should render developer service_tier");
const profileOutput = runCli("src", ["profile", "--target", highTmp]);
assert(profileOutput.includes("Model profile: high"), "profile should infer high model profile");
assert(profileOutput.includes("Fast mode: on"), "profile should infer fast mode");
runCli("src", ["profile", "--model", "xhigh", "--fast", "off", "--target", highTmp]);
const xhighConfig = readText(highTmp, ".codex", "config.toml");
const xhighDeveloperAgent = readText(highTmp, ".codex", "agents", "developer.toml");
assert(xhighConfig.includes('model_reasoning_effort = "xhigh"'), "profile should update root reasoning");
assert(!xhighConfig.includes("service_tier"), "profile should remove root fast mode");
assert(xhighDeveloperAgent.includes('model_reasoning_effort = "xhigh"'), "profile should update agent reasoning");
assert(!xhighDeveloperAgent.includes("service_tier"), "profile should remove agent fast mode");
runCli("src", ["profile", "--fast", "on", "--target", highTmp]);
const fastAgainConfig = readText(highTmp, ".codex", "config.toml");
const fastAgainDeveloperAgent = readText(highTmp, ".codex", "agents", "developer.toml");
assert(fastAgainConfig.includes('service_tier = "fast"'), "profile should enable root fast mode");
assert(fastAgainDeveloperAgent.includes('model_reasoning_effort = "xhigh"'), "profile fast-only update should preserve inferred profile");
assert(fastAgainDeveloperAgent.includes('service_tier = "fast"'), "profile should enable agent fast mode");
assert(enMainThread.includes("Decision Routing"), "en main-thread should define decision routing");
assert(enMainThread.includes("Only unresolved PM or Architect"), "en main-thread should limit user decision escalation");
assert(enMainThread.includes("$spec:brainstorm"), "en main-thread should define brainstorm workflow");
assert(enFileProtocol.includes("User decision required"), "en file protocol should define decision request format");
assert(enFileProtocol.includes(".agentflow/brainstorm/<brainstorm-id>/"), "en file protocol should define brainstorm session path");
assert(enFileProtocol.includes("rounds/"), "en file protocol should define brainstorm rounds");
assert(enFileProtocol.includes("round-001"), "en file protocol should show append-only round directories");
assert(!enFileProtocol.includes("questions.md"), "en file protocol should not use the old shared questions file");
assert(enFileProtocol.includes(".agentflow/archives/brainstorm/<brainstorm-id>/"), "en file protocol should define brainstorm archive path");
assert(enFileProtocol.includes("src/example-feature/**"), "en gate example should be feature-scoped");
assert(!enFileProtocol.includes("src/**"), "en gate example should not use repo-wide source scope");
assert(enSubagentContract.includes("crosses the current role boundary"), "en subagent contract should define decision request boundaries");
assert(enSubagentContract.includes("Inputs read"), "en subagent contract should require standard report inputs");
assert(!enSubagentContract.includes("Files written:"), "en subagent contract should not use legacy report fields");
assert(pmAgent.includes("standard report format"), "en pm agent should use standard report format");
assert(!pmAgent.includes("$finish"), "en pm agent should not reference removed finish skill");
assert(!architectAgent.includes("$finish"), "en architect agent should not reference removed finish skill");
assert(!testerAgent.includes("$finish"), "en tester agent should not reference removed finish skill");
assert(enBrainstormSkill.includes(".agentflow/state.json.current_brainstorm"), "en brainstorm skill should track current brainstorm");
assert(enBrainstormSkill.includes("Context Inputs"), "en brainstorm skill should use context input wording");
assert(enBrainstormSkill.includes(".agentflow/brainstorm/<brainstorm-id>/brief.md"), "en brainstorm skill should write brainstorm brief under its id");
assert(enBrainstormSkill.includes("rounds/round-<nnn>/round.md"), "en brainstorm skill should write round files");
assert(enBrainstormSkill.includes("codex-spec archive --brainstorm <brainstorm-id>"), "en brainstorm skill should archive completed brainstorms");
assert(enBrainstormSkill.includes(".agentflow/archives/brainstorm/<brainstorm-id>/brief.md"), "en brainstorm skill should point to archived planning brief");
assert(enBrainstormSkill.includes("at most 1-3 blocking questions"), "en brainstorm skill should limit question rounds");
assert(enBrainstormSkill.includes("numbered options"), "en brainstorm skill should ask with options");
assert(!enPlanSkill.includes("brainstorm/*/brief.md"), "en plan skill should not use brainstorm glob paths");
assert(enPlanSkill.includes("PM Decision Handling"), "en plan skill should handle PM decision requests");
assert(enPlanSkill.includes("current_brainstorm"), "en plan skill should close active brainstorm briefs");
assert(enPlanSkill.includes("specified `ready-for-plan` brainstorm brief"), "en plan skill should use the specified brainstorm brief");
assert(enPlanSkill.includes(".agentflow/archives/brainstorm/<brainstorm-id>/brief.md"), "en plan skill should use archived brainstorm briefs");
assert(enResumeSkill.includes("current_brainstorm"), "en resume skill should restore active brainstorms");
assert(enStatusSkill.includes("brainstorm id"), "en status skill should report brainstorm id");
assert(enPmRole.includes("2-4 options"), "en PM role should request numbered options");
assert(enArchitectRole.includes("Decision Request"), "en Architect role should return decision requests");
assert(enDocReviewerRole.includes("Strict mode"), "en Doc Reviewer role should enforce strict mode");
assert(enCodeReviewerRole.includes("Developer rationale does not waive"), "en Code Reviewer role should not accept developer rationale alone");
for (const removedSkill of ["brainstorm", "plan", "design", "execute", "auto", "status", "resume", "doc-review", "code-review", "verify", "finish"]) {
  assert(!fs.existsSync(path.join(highTmp, ".agents", "skills", removedSkill, "SKILL.md")), `${removedSkill} should not be a user-facing skill`);
}

console.log(`source init OK: ${tmp}`);
