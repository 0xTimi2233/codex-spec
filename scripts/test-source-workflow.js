import fs from "node:fs";
import path from "node:path";
import { assert, runCli, runCliFail, runHook, tempDir } from "./test-utils.js";

const tmp = tempDir("codex-spec-source-workflow-");
runCli("src", ["init", "--lang", "zh", "--target", tmp]);

const idleSourceWrite = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Write",
  tool_input: { file_path: "README.md" }
});
assert(idleSourceWrite.continue === true, "idle manual source writes should be allowed outside active runs");

const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");

const invalidArchive = runCliFail("src", ["archive", "--run", "../bad", "--target", tmp]);
assert(invalidArchive.includes("Invalid run id"), "archive should reject unsafe run ids");

runCli("src", ["archive", "--run", "smoke-run", "--target", tmp]);
assert(!fs.existsSync(runDir), "archive should move run out of runs/");
assert(fs.existsSync(path.join(tmp, ".agentflow", "archives", "smoke-run")), "archive directory was not created");

fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(
  path.join(tmp, ".agentflow", "state.json"),
  JSON.stringify(
    {
      version: 1,
      mode: "active",
      current_run: "smoke-run",
      current_phase: "executing",
      current_milestone: "smoke",
      blocked: false,
      updated_by: "smoke"
    },
    null,
    2
  )
);
runCli("src", ["doctor", "--target", tmp]);

fs.writeFileSync(
  path.join(runDir, "gate.md"),
  `---
status: approved
allowed_source_paths:
  - src/**
allowed_test_paths:
  - tests/**
required_tests:
  - npm test
doc_review_report: .agentflow/runs/smoke-run/doc-reviewer/review-report.md
---
`,
  "utf8"
);

const allowedHook = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Write",
  tool_input: { file_path: "src/example.js" }
});
assert(allowedHook.continue === true, "approved gate should allow source path");

const allowedPatch = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "apply_patch",
  tool_input: { patch: "*** Begin Patch\n*** Add File: src/main.js\n+console.log('ok');\n*** End Patch\n" }
});
assert(allowedPatch.continue === true, "apply_patch should parse full allowed paths containing n");

const allowedBash = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Bash",
  tool_input: { command: "touch src/generated.js" }
});
assert(allowedBash.continue === true, "Bash touch should allow approved target paths");

const deniedHook = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Write",
  tool_input: { file_path: "README.md" }
});
assert(deniedHook.hookSpecificOutput?.permissionDecision === "deny", "approved gate should deny paths outside allowed scope");

const traversalHook = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Write",
  tool_input: { file_path: "src/../README.md" }
});
assert(traversalHook.hookSpecificOutput?.permissionDecision === "deny", "gate should deny traversal outside allowed paths");

const deniedPatch = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "apply_patch",
  tool_input: { patch: "*** Begin Patch\n*** Update File: README.md\n@@\n-test\n+test\n*** End Patch\n" }
});
assert(deniedPatch.hookSpecificOutput?.permissionDecision === "deny", "apply_patch should deny paths outside allowed scope");

const deniedBash = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Bash",
  tool_input: { command: "rm README.md src/example.js" }
});
assert(deniedBash.hookSpecificOutput?.permissionDecision === "deny", "Bash multi-target writes should deny outside gate paths");

const ambiguousBash = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Bash",
  tool_input: { command: "sed -i 's/a/b/' src/example.js" }
});
assert(ambiguousBash.hookSpecificOutput?.permissionDecision === "deny", "ambiguous in-place Bash writes should be denied");

const inlinePythonBash = runHook("pre-tool-use", tmp, {
  cwd: tmp,
  tool_name: "Bash",
  tool_input: { command: "python3 -c \"open('src/generated.py', 'w').write('ok')\"" }
});
assert(inlinePythonBash.hookSpecificOutput?.permissionDecision === "deny", "inline Python Bash writes should be denied");

console.log(`source workflow OK: ${tmp}`);
