import fs from "node:fs";
import path from "node:path";
import { assert, readText, root, runCli, tempDir } from "./test-utils.js";

const LEGACY_WORKFLOW_SKILL = /\$(brainstorm|preflight|plan|design|execute|auto|resume|status)\b/;
const WORKFLOW_SKILLS = ["spec:plan", "spec:design", "spec:execute", "spec:auto", "spec:status", "spec:resume"];

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
    assert(!content.includes("$spec:brainstorm"), `${label} should not reference removed spec:brainstorm in ${rel}`);
    assert(!content.includes("$spec:preflight"), `${label} should not reference removed spec:preflight in ${rel}`);
  }
}

function assertWorkflowSkillSet(root) {
  for (const skill of WORKFLOW_SKILLS) {
    assert(fs.existsSync(path.join(root, ".agents", "skills", skill, "SKILL.md")), `${skill} should be installed`);
  }
  for (const removedSkill of ["brainstorm", "preflight", "plan", "design", "execute", "auto", "status", "resume", "doc-review", "code-review", "verify", "finish", "spec:brainstorm", "spec:preflight"]) {
    assert(!fs.existsSync(path.join(root, ".agents", "skills", removedSkill, "SKILL.md")), `${removedSkill} should not be installed as a user-facing skill`);
    assert(!fs.existsSync(path.join(root, ".agents", "skills", removedSkill)), `${removedSkill} skill directory should not be installed`);
  }
}

function assertPlanningDocs(root, lang) {
  const mainThread = readText(root, ".codex", "prompts", "main-thread.md");
  const fileProtocol = readText(root, ".codex", "prompts", "file-protocol.md");
  const planSkill = readText(root, ".agents", "skills", "spec:plan", "SKILL.md");
  const designSkill = readText(root, ".agents", "skills", "spec:design", "SKILL.md");
  const resumeSkill = readText(root, ".agents", "skills", "spec:resume", "SKILL.md");
  const statusSkill = readText(root, ".agents", "skills", "spec:status", "SKILL.md");
  const subagentContract = readText(root, ".codex", "prompts", "subagent-contract.md");
  const pmRole = readText(root, ".codex", "prompts", "roles", "pm.md");
  const architectRole = readText(root, ".codex", "prompts", "roles", "architect.md");
  const docReviewerRole = readText(root, ".codex", "prompts", "roles", "doc-reviewer.md");
  const codeReviewerRole = readText(root, ".codex", "prompts", "roles", "code-reviewer.md");

  assert(mainThread.includes(lang === "zh" ? "决策路由" : "Decision Routing"), `${lang} main-thread should define decision routing`);
  assert(mainThread.includes(lang === "zh" ? "只有 PM 或 Architect" : "Only unresolved PM or Architect"), `${lang} main-thread should limit user decision escalation`);
  assert(mainThread.includes("explore` track") || mainThread.includes("`explore` track"), `${lang} main-thread should define explore track`);
  assert(mainThread.includes("`preflight` track"), `${lang} main-thread should define preflight track`);
  assert(mainThread.includes("`commit` track"), `${lang} main-thread should define commit track`);
  assert(mainThread.includes(lang === "zh" ? "planning package 作为需求来源" : "planning package as its requirements source"), `${lang} design contract should depend on planning package`);

  assert(fileProtocol.includes(".agentflow/explore/<explore-id>/"), `${lang} file protocol should define explore session path`);
  assert(fileProtocol.includes("rounds/"), `${lang} file protocol should define explore rounds`);
  assert(fileProtocol.includes("round-001"), `${lang} file protocol should show append-only round directories`);
  assert(fileProtocol.includes(".agentflow/archives/explore/<explore-id>/"), `${lang} file protocol should define explore archive path`);
  assert(fileProtocol.includes(".agentflow/preflight/<preflight-id>/"), `${lang} file protocol should define preflight session path`);
  assert(fileProtocol.includes("blocker-ledger.md"), `${lang} file protocol should define preflight blocker ledger`);
  assert(fileProtocol.includes("decisions/batches"), `${lang} file protocol should define stable preflight decision batches`);
  assert(fileProtocol.includes(".agentflow/archives/preflight/<preflight-id>/"), `${lang} file protocol should define preflight archive path`);
  assert(fileProtocol.includes("pm/requirements.md"), `${lang} file protocol should define planning package requirements`);
  assert(fileProtocol.includes("pm/acceptance-criteria.md"), `${lang} file protocol should define planning package acceptance criteria`);
  assert(fileProtocol.includes("src/example-feature/**"), `${lang} gate example should be feature-scoped`);
  assert(!fileProtocol.includes("questions.md"), `${lang} file protocol should not use the old shared questions file`);
  assert(!fileProtocol.includes("src/**"), `${lang} gate example should not use repo-wide source scope`);

  assert(planSkill.includes("current_planning_session"), `${lang} plan skill should track current planning session`);
  assert(planSkill.includes("planning_track"), `${lang} plan skill should track planning track`);
  assert(planSkill.includes("codex-spec archive --explore <explore-id>"), `${lang} plan skill should archive completed explore sessions`);
  assert(planSkill.includes("codex-spec archive --preflight <preflight-id>"), `${lang} plan skill should archive completed preflights`);
  assert(planSkill.includes("Planning Package"), `${lang} plan skill should define the planning package`);
  assert(planSkill.includes("pm/planning-summary.md"), `${lang} plan skill should write planning summary`);
  assert(designSkill.includes("pm/requirements.md"), `${lang} design skill should read planning requirements`);
  assert(designSkill.includes("pm/scope.md"), `${lang} design skill should read planning scope`);
  assert(resumeSkill.includes("current_planning_session"), `${lang} resume skill should restore planning sessions`);
  assert(statusSkill.includes("planning track"), `${lang} status skill should report planning track`);

  assert(subagentContract.includes(lang === "zh" ? "跨越当前角色边界" : "crosses the current role boundary"), `${lang} subagent contract should define decision request boundaries`);
  assert(subagentContract.includes("Inputs read"), `${lang} subagent contract should require standard report inputs`);
  assert(!subagentContract.includes("Files written:"), `${lang} subagent contract should not use legacy report fields`);
  assert(pmRole.includes(lang === "zh" ? "2-4 个选项" : "2-4 options"), `${lang} PM role should request numbered options`);
  assert(architectRole.includes("Decision Request"), `${lang} Architect role should return decision requests`);
  assert(docReviewerRole.includes(lang === "zh" ? "严格模式" : "Strict mode"), `${lang} Doc Reviewer role should enforce strict mode`);
  assert(codeReviewerRole.includes(lang === "zh" ? "Developer 解释不能免除" : "Developer rationale does not waive"), `${lang} Code Reviewer role should not accept developer rationale alone`);
}

function assertGeneratedDirs(root) {
  assert(fs.existsSync(path.join(root, ".agentflow", "explore", ".gitkeep")), "explore directory should be initialized");
  assert(fs.existsSync(path.join(root, ".agentflow", "preflight", ".gitkeep")), "preflight directory should be initialized");
  assert(fs.existsSync(path.join(root, ".agentflow", "archives", "explore", ".gitkeep")), "explore archive directory should be initialized");
  assert(fs.existsSync(path.join(root, ".agentflow", "archives", "preflight", ".gitkeep")), "preflight archive directory should be initialized");
}

function assertTemplateDirs(lang) {
  const templateRoot = path.join(root, "common", lang);
  assert(fs.existsSync(path.join(templateRoot, ".agentflow", "explore", ".gitkeep")), `${lang} template should include explore placeholder`);
  assert(fs.existsSync(path.join(templateRoot, ".agentflow", "preflight", ".gitkeep")), `${lang} template should include preflight placeholder`);
  assert(fs.existsSync(path.join(templateRoot, ".agentflow", "archives", "explore", ".gitkeep")), `${lang} template should include explore archive placeholder`);
  assert(fs.existsSync(path.join(templateRoot, ".agentflow", "archives", "preflight", ".gitkeep")), `${lang} template should include preflight archive placeholder`);
}

const tmp = tempDir("codex-spec-source-init-");
assertTemplateDirs("zh");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);
assertNoLegacyWorkflowSkills(tmp, "zh init");
assertWorkflowSkillSet(tmp);
assertPlanningDocs(tmp, "zh");
assertGeneratedDirs(tmp);

const defaultConfig = readText(tmp, ".codex", "config.toml");
const defaultState = readText(tmp, ".agentflow", "state.json");
const zhPmAgent = readText(tmp, ".codex", "agents", "pm.toml");
const zhArchitectAgent = readText(tmp, ".codex", "agents", "architect.toml");
const zhTesterAgent = readText(tmp, ".codex", "agents", "tester.toml");
assert(defaultConfig.includes('model = "gpt-5.5"'), "default model was not rendered");
assert(defaultConfig.includes('model_reasoning_effort = "xhigh"'), "main thread reasoning should be xhigh");
assert(!defaultConfig.includes("service_tier"), "fast mode should be off by default");
assert(!zhPmAgent.includes("service_tier"), "fast mode off should not render agent service_tier");
assert(defaultState.includes('"current_planning_session": null'), "state should track current planning session");
assert(defaultState.includes('"planning_track": null'), "state should track planning track");
assert(zhPmAgent.includes("标准报告格式"), "zh pm agent should use standard report format");
assert(!zhPmAgent.includes("$finish"), "zh pm agent should not reference removed finish skill");
assert(!zhArchitectAgent.includes("$finish"), "zh architect agent should not reference removed finish skill");
assert(!zhTesterAgent.includes("$finish"), "zh tester agent should not reference removed finish skill");

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
assertTemplateDirs("en");
runCli("src", ["init", "--lang", "en", "--model", "high", "--fast", "on", "--target", highTmp]);
assertNoLegacyWorkflowSkills(highTmp, "en init");
assertWorkflowSkillSet(highTmp);
assertPlanningDocs(highTmp, "en");
assertGeneratedDirs(highTmp);

const highConfig = readText(highTmp, ".codex", "config.toml");
const pmAgent = readText(highTmp, ".codex", "agents", "pm.toml");
const architectAgent = readText(highTmp, ".codex", "agents", "architect.toml");
const developerAgent = readText(highTmp, ".codex", "agents", "developer.toml");

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

console.log(`source init OK: ${tmp}`);
