import { additionalContext, currentSummary, readStdinJson, resolveRoot } from "./common.js";

const input = await readStdinJson();
const root = resolveRoot(input);
if (!root) {
  additionalContext("UserPromptSubmit", "codex-spec: project is not initialized. Run `codex-spec init` first if you want to use the workflow.");
} else {
  const { state, relRun } = currentSummary(root);
  additionalContext("UserPromptSubmit", [
    "codex-spec workflow state:",
    `- phase: ${state.current_phase}`,
    `- mode: ${state.mode}`,
    `- run: ${relRun || "none"}`,
    `- milestone: ${state.current_milestone || "none"}`,
    `- blocked: ${state.blocked}`,
    "Use repo-relative paths. Read `.codex/prompts/main-workflow.md` and `.codex/prompts/file-protocol.md`."
  ].join("\n"));
}
