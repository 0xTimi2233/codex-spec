import { blockPreToolUse, continueOk, currentSummary, fileExists, isWorkflowPath, readStdinJson, resolveRoot } from "./common.js";
import path from "node:path";

const input = await readStdinJson();
const root = resolveRoot(input);
if (!root) {
  continueOk();
} else {
  const tool = input.tool_name || "";
  const writes = /^(Write|Edit|apply_patch)$/.test(tool);
  if (!writes) {
    continueOk();
  } else {
    const { state, runPath } = currentSummary(root);
    const workflowPath = isWorkflowPath(input.tool_input);
    if (workflowPath) {
      continueOk();
    } else if (state.current_phase !== "executing") {
      blockPreToolUse(`codex-spec: source edits are blocked in phase '${state.current_phase}'. Run $plan and $execute first, or write workflow artifacts under agentflow/ or .agentflow/.`);
    } else if (!runPath) {
      blockPreToolUse("codex-spec: source edits are blocked because .agentflow/state.json has no current_run.");
    } else {
      const gate = path.join(runPath, "gate.md");
      if (!fileExists(gate)) {
        blockPreToolUse(`codex-spec: source edits are blocked because ${path.relative(root, gate)} is missing.`);
      } else {
        continueOk();
      }
    }
  }
}
