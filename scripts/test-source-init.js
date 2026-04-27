import fs from "node:fs";
import path from "node:path";
import { assert, readText, root, runCli, runCliFail, tempDir } from "./test-utils.js";

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
  const glossary = readText(root, ".codex", "prompts", "glossary.md");
  const fileIndex = readText(root, ".codex", "prompts", "file-index.md");
  const reportContract = readText(root, ".codex", "prompts", "report-contract.md");
  const planSkill = readText(root, ".agents", "skills", "spec:plan", "SKILL.md");
  const autoSkill = readText(root, ".agents", "skills", "spec:auto", "SKILL.md");
  const designSkill = readText(root, ".agents", "skills", "spec:design", "SKILL.md");
  const executeSkill = readText(root, ".agents", "skills", "spec:execute", "SKILL.md");
  const resumeSkill = readText(root, ".agents", "skills", "spec:resume", "SKILL.md");
  const statusSkill = readText(root, ".agents", "skills", "spec:status", "SKILL.md");
  const subagentContract = readText(root, ".codex", "prompts", "subagent-contract.md");
  const pmRole = readText(root, ".codex", "prompts", "roles", "pm.md");
  const architectRole = readText(root, ".codex", "prompts", "roles", "architect.md");
  const docReviewerRole = readText(root, ".codex", "prompts", "roles", "doc-reviewer.md");
  const codeReviewerRole = readText(root, ".codex", "prompts", "roles", "code-reviewer.md");
  const agentConfigs = generatedFiles(root, ".codex/agents").map((rel) => readText(root, rel)).join("\n");

  assert(!fs.existsSync(path.join(root, ".codex", "prompts", "file-protocol.md")), `${lang} should not install the old file-protocol prompt`);
  assert(mainThread.includes(lang === "zh" ? "工作流循环" : "Workflow Loop"), `${lang} main-thread should focus on workflow loop`);
  assert(mainThread.includes(lang === "zh" ? "决策路由" : "Decision Routing"), `${lang} main-thread should define decision routing`);
  assert(mainThread.includes(lang === "zh" ? "只有 PM 或 Architect" : "Only unresolved PM or Architect"), `${lang} main-thread should limit user decision escalation`);
  assert(mainThread.includes(lang === "zh" ? "打回与路由" : "Rejection Routing"), `${lang} main-thread should define rejection routing`);
  assert(mainThread.includes(lang === "zh" ? "Milestone 边界" : "Milestone Boundary"), `${lang} main-thread should define milestone boundary`);
  assert(mainThread.includes(".codex/prompts/file-index.md"), `${lang} main-thread should use file index`);
  assert(mainThread.includes(".codex/prompts/report-contract.md"), `${lang} main-thread should use report contract`);
  assert(mainThread.includes(lang === "zh" ? "关闭子代理" : "close the subagent"), `${lang} main-thread should define subagent closure`);
  assert(!mainThread.includes("Public CLI commands"), `${lang} main-thread should not describe public CLI commands`);
  assert(!mainThread.includes("对用户公开的 CLI"), `${lang} main-thread should not describe public CLI commands`);
  assert(mainThread.includes(lang === "zh" ? "后续 workflow context 来自 `codexspec/`" : "Future workflow context comes from `codexspec/`"), `${lang} main-thread should keep codexspec as the future context source`);
  assert(!mainThread.includes(lang === "zh" ? "`$spec:design`：" : "`$spec:design`:"), `${lang} main-thread should not duplicate design skill flow`);
  assert(!mainThread.includes(lang === "zh" ? "`$spec:execute`：" : "`$spec:execute`:"), `${lang} main-thread should not duplicate execute skill flow`);
  assert(!mainThread.includes("gate.md"), `${lang} main-thread should not reference gate.md`);

  assert(glossary.includes("planning track"), `${lang} glossary should define planning track`);
  assert(glossary.includes("dispatch packet"), `${lang} glossary should define dispatch packet`);
  assert(glossary.includes("archive"), `${lang} glossary should define archive`);

  assert(fileIndex.includes("codexspec/runtime/explore/<explore-id>/"), `${lang} file index should define explore session path`);
  assert(fileIndex.includes("dispatch/<role>-<task-id>.md"), `${lang} file index should define dispatch packet path`);
  assert(fileIndex.includes("rounds/<round-id>/round.md"), `${lang} file index should define explore rounds`);
  assert(fileIndex.includes("codexspec/runtime/archives/runs/<run-id>/"), `${lang} file index should define run archive path`);
  assert(fileIndex.includes("codexspec/runtime/archives/explore/<explore-id>/"), `${lang} file index should define explore archive path`);
  assert(fileIndex.includes("codexspec/runtime/preflight/<preflight-id>/"), `${lang} file index should define preflight session path`);
  assert(fileIndex.includes("blocker-ledger.md"), `${lang} file index should define preflight blocker ledger`);
  assert(fileIndex.includes("decisions/batches/<batch-id>.md"), `${lang} file index should define stable preflight decision batches`);
  assert(fileIndex.includes("codexspec/runtime/archives/preflight/<preflight-id>/"), `${lang} file index should define preflight archive path`);
  assert(fileIndex.includes("pm/requirements.md"), `${lang} file index should define planning package requirements`);
  assert(fileIndex.includes("pm/acceptance-criteria.md"), `${lang} file index should define planning package acceptance criteria`);
  assert(fileIndex.includes(lang === "zh" ? "不是可复用项目知识" : "not reusable project knowledge"), `${lang} file index should keep PM package run-scoped`);
  assert(!fileIndex.includes("Report Format"), `${lang} file index should not define report format`);
  assert(!fileIndex.includes("Decision Request"), `${lang} file index should not define decision request format`);
  assert(!fileIndex.includes("questions.md"), `${lang} file index should not use the old shared questions file`);
  assert(!fileIndex.includes("gate.md"), `${lang} file index should not define gate.md`);
  assert(!fileIndex.includes("allowed_source_paths"), `${lang} file index should not use gate frontmatter`);
  assert(!fileIndex.includes("src/**"), `${lang} file index should not use repo-wide source examples`);

  assert(reportContract.includes("Decision Request"), `${lang} report contract should define decision request`);
  assert(reportContract.includes("Inputs read"), `${lang} report contract should require standard report inputs`);
  assert(reportContract.includes("done-with-concerns"), `${lang} report contract should define status values`);

  assert(planSkill.includes("current_planning_session"), `${lang} plan skill should track current planning session`);
  assert(planSkill.includes("planning_track"), `${lang} plan skill should track planning track`);
  assert(!planSkill.includes("codexspec/runtime/state.json.current_planning_session"), `${lang} plan skill should not describe state fields as file paths`);
  assert(!planSkill.includes("codexspec/runtime/state.json.planning_track"), `${lang} plan skill should not describe state fields as file paths`);
  assert(planSkill.includes("codex-spec-internal archive --explore <explore-id>"), `${lang} plan skill should archive completed explore sessions`);
  assert(planSkill.includes("codex-spec-internal archive --preflight <preflight-id>"), `${lang} plan skill should archive completed preflights`);
  assert(planSkill.includes("codexspec/runtime/explore/<explore-id>/dispatch/pm-<n>.md"), `${lang} plan skill should write explore PM dispatches`);
  assert(planSkill.includes("codexspec/runtime/preflight/<preflight-id>/dispatch/pm-<n>.md"), `${lang} plan skill should write preflight PM dispatches`);
  assert(planSkill.includes("Planning Package"), `${lang} plan skill should define the planning package`);
  assert(planSkill.includes("pm/planning-summary.md"), `${lang} plan skill should write planning summary`);
  assert(planSkill.includes(lang === "zh" ? "调度 PM" : "dispatch PM"), `${lang} plan skill should use PM dispatch`);
  assert(designSkill.includes("pm/requirements.md"), `${lang} design skill should read planning requirements`);
  assert(designSkill.includes("pm/scope.md"), `${lang} design skill should read planning scope`);
  assert(designSkill.includes("doc-reviewing"), `${lang} design skill should set doc-reviewing phase`);
  assert(designSkill.includes("codexspec/spec/*.md"), `${lang} design skill should update authoritative specs`);
  assert(!designSkill.includes("gate.md"), `${lang} design skill should not create gate.md`);
  assert(executeSkill.includes(lang === "zh" ? "commit 或 no-op 成功后" : "After commit or no-op succeeds"), `${lang} execute skill should clear state after commit or no-op`);
  assert(executeSkill.includes("Doc Reviewer"), `${lang} execute skill should require doc reviewer pass`);
  assert(executeSkill.includes(lang === "zh" ? "不要通过理解 ADR" : "Do not derive scope"), `${lang} execute skill should copy scope from reports`);
  assert(executeSkill.includes(lang === "zh" ? "finish 阶段不新增 ADR" : "Do not introduce new ADR"), `${lang} execute skill should not bypass doc review during finish`);
  assert(!executeSkill.includes("gate.md"), `${lang} execute skill should not depend on gate.md`);
  assert(autoSkill.includes(lang === "zh" ? "inline requirement" : "inline requirement"), `${lang} auto skill should support inline requirements`);
  assert(autoSkill.includes(lang === "zh" ? "打回与路由" : "Rejection Routing"), `${lang} auto skill should reuse main-thread rejection routing`);
  assert(autoSkill.includes(lang === "zh" ? "Milestone 边界" : "Milestone Boundary"), `${lang} auto skill should reuse main-thread milestone boundary`);
  assert(!autoSkill.includes("Stop automatic progress only"), `${lang} auto skill should not duplicate stop rules`);
  assert(!autoSkill.includes("只有以下情况停止自动推进"), `${lang} auto skill should not duplicate stop rules`);
  assert(resumeSkill.includes("current_planning_session"), `${lang} resume skill should restore planning sessions`);
  assert(resumeSkill.includes(".codex/prompts/main-thread.md"), `${lang} resume skill should read main-thread protocol`);
  assert(resumeSkill.includes(".codex/prompts/glossary.md"), `${lang} resume skill should read glossary`);
  assert(resumeSkill.includes(".codex/prompts/file-index.md"), `${lang} resume skill should read file index`);
  assert(statusSkill.includes("planning track"), `${lang} status skill should report planning track`);

  assert(subagentContract.includes(".codex/prompts/report-contract.md"), `${lang} subagent contract should reference report contract`);
  assert(!subagentContract.includes("- `.codex/prompts/file-index.md`"), `${lang} subagent contract should not require file index by default`);
  assert(!subagentContract.includes(".codex/prompts/file-protocol.md"), `${lang} subagent contract should not mention old file protocol`);
  assert(!subagentContract.includes(".codex/prompts/main-thread.md"), `${lang} subagent contract should not repeat main-thread read boundary`);
  assert(!subagentContract.includes("Files written:"), `${lang} subagent contract should not use legacy report fields`);
  assert(!agentConfigs.includes("file-protocol.md"), `${lang} agent configs should not require file protocol by default`);
  assert(agentConfigs.includes("subagent-contract.md"), `${lang} agent configs should use subagent contract`);
  assert(agentConfigs.includes("report-contract.md"), `${lang} agent configs should use report contract`);
  assert(pmRole.includes(lang === "zh" ? "2-4 个选项" : "2-4 options"), `${lang} PM role should request numbered options`);
  assert(architectRole.includes("Decision Request"), `${lang} Architect role should return decision requests`);
  assert(docReviewerRole.includes(lang === "zh" ? "严格模式" : "Strict mode"), `${lang} Doc Reviewer role should enforce strict mode`);
  assert(codeReviewerRole.includes(lang === "zh" ? "Developer 解释不能免除" : "Developer rationale does not waive"), `${lang} Code Reviewer role should not accept developer rationale alone`);
}

function assertGeneratedDirs(root) {
  assert(fs.existsSync(path.join(root, "codexspec/runtime", "explore", ".gitkeep")), "explore directory should be initialized");
  assert(fs.existsSync(path.join(root, "codexspec/runtime", "preflight", ".gitkeep")), "preflight directory should be initialized");
  assert(fs.existsSync(path.join(root, "codexspec/runtime", "archives", "runs", ".gitkeep")), "run archive directory should be initialized");
  assert(fs.existsSync(path.join(root, "codexspec/runtime", "archives", "explore", ".gitkeep")), "explore archive directory should be initialized");
  assert(fs.existsSync(path.join(root, "codexspec/runtime", "archives", "preflight", ".gitkeep")), "preflight archive directory should be initialized");
}

function assertTemplateDirs(lang) {
  const templateRoot = path.join(root, "common", lang);
  assert(fs.existsSync(path.join(templateRoot, "codexspec/runtime", "explore", ".gitkeep")), `${lang} template should include explore placeholder`);
  assert(fs.existsSync(path.join(templateRoot, "codexspec/runtime", "preflight", ".gitkeep")), `${lang} template should include preflight placeholder`);
  assert(fs.existsSync(path.join(templateRoot, "codexspec/runtime", "archives", "runs", ".gitkeep")), `${lang} template should include run archive placeholder`);
  assert(fs.existsSync(path.join(templateRoot, "codexspec/runtime", "archives", "explore", ".gitkeep")), `${lang} template should include explore archive placeholder`);
  assert(fs.existsSync(path.join(templateRoot, "codexspec/runtime", "archives", "preflight", ".gitkeep")), `${lang} template should include preflight archive placeholder`);
}

const tmp = tempDir("codex-spec-source-init-");
assertTemplateDirs("zh");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);
assertNoLegacyWorkflowSkills(tmp, "zh init");
assertWorkflowSkillSet(tmp);
assertPlanningDocs(tmp, "zh");
assertGeneratedDirs(tmp);
assert(!fs.existsSync(path.join(tmp, "AGENTS.md")), "init should not generate AGENTS.md");

const defaultConfig = readText(tmp, ".codex", "config.toml");
const defaultState = readText(tmp, "codexspec/runtime", "state.json");
const zhPmAgent = readText(tmp, ".codex", "agents", "pm.toml");
const zhArchitectAgent = readText(tmp, ".codex", "agents", "architect.toml");
const zhTesterAgent = readText(tmp, ".codex", "agents", "tester.toml");
assert(defaultConfig.includes('model = "gpt-5.5"'), "default model was not rendered");
assert(defaultConfig.includes('model_reasoning_effort = "xhigh"'), "main thread reasoning should be xhigh");
assert(!defaultConfig.includes("service_tier"), "fast mode should be off by default");
assert(!zhPmAgent.includes("service_tier"), "fast mode off should not render agent service_tier");
assert(defaultState.includes('"current_planning_session": null'), "state should track current planning session");
assert(defaultState.includes('"planning_track": null'), "state should track planning track");
assert(!defaultState.includes('"mode"'), "state should not include duplicate mode field");
assert(zhPmAgent.includes("标准报告格式"), "zh pm agent should use standard report format");
assert(!zhPmAgent.includes("$finish"), "zh pm agent should not reference removed finish skill");
assert(!zhArchitectAgent.includes("$finish"), "zh architect agent should not reference removed finish skill");
assert(!zhTesterAgent.includes("$finish"), "zh tester agent should not reference removed finish skill");

runCli("src", ["--version"]);
const helpOutput = runCli("src", ["help"]);
assert(helpOutput.includes("codex-spec init"), "help should show init");
assert(helpOutput.includes("codex-spec doctor"), "help should show doctor");
assert(helpOutput.includes("codex-spec profile"), "help should show profile");
assert(!helpOutput.includes("codex-spec status"), "help should not expose status");
assert(!helpOutput.includes("codex-spec state"), "help should not expose state");
assert(!helpOutput.includes("codex-spec archive"), "help should not expose archive");
assert(runCliFail("src", ["state", "set", "--target", tmp]).includes("Unknown command"), "public cli should reject state");
assert(runCliFail("src", ["archive", "--target", tmp]).includes("Unknown command"), "public cli should reject archive");
assert(runCliFail("src", ["status", "--target", tmp]).includes("Unknown command"), "public cli should reject status");
runCli("src", ["doctor", "--target", tmp]);
assert(!runCli("src", ["help"]).includes("AGENTS.md"), "help should not mention AGENTS.md");

const customAgents = "# Custom agents\n";
const customVision = "# Custom vision\n";
fs.writeFileSync(path.join(tmp, "AGENTS.md"), customAgents, "utf8");
fs.writeFileSync(path.join(tmp, "codexspec", "vision.md"), customVision, "utf8");

runCli("src", ["init", "--lang", "zh", "--target", tmp]);
assert(readText(tmp, "AGENTS.md") === customAgents, "init should not touch existing project AGENTS.md by default");
assert(readText(tmp, "codexspec", "vision.md") === customVision, "init should preserve existing codexspec files by default");

runCli("src", ["init", "--lang", "zh", "--force", "--target", tmp]);
assert(readText(tmp, "AGENTS.md") === customAgents, "--force should not touch existing project AGENTS.md");
assert(readText(tmp, "codexspec", "vision.md") === customVision, "--force should not overwrite existing codexspec files");

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
