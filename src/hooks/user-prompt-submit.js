import { currentSummary, resolveRoot } from "../lib/hook/context.js";
import { additionalContext, readStdinJson } from "../lib/hook/io.js";

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
    "Use repo-relative paths. Main thread reads `.codex/prompts/main-thread.md`; subagents read only dispatch-listed files, `.codex/prompts/subagent-contract.md`, `.codex/prompts/file-protocol.md`, and their own role prompt."
  ].join("\n"));
}
