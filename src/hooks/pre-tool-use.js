import path from "node:path";
import { isPathAllowedByGate, readGate } from "../lib/gate.js";
import {
  blockPreToolUse,
  continueOk,
  currentSummary,
  isWorkflowPath,
  readStdinJson,
  resolveRoot,
  writeTargetsFromToolInput
} from "./common.js";

const input = await readStdinJson();
const root = resolveRoot(input);

if (!root) {
  continueOk();
} else {
  const tool = input.tool_name || "";
  const writes = /^(Write|Edit|apply_patch|Bash)$/.test(tool);
  const targets = writes ? writeTargetsFromToolInput(tool, input.tool_input) : [];

  if (!writes || (tool === "Bash" && !targets.length)) {
    continueOk();
  } else if (targets.length && targets.every((target) => isWorkflowPath(target))) {
    continueOk();
  } else if (!targets.length) {
    blockPreToolUse(`codex-spec: ${tool} write target could not be identified. Use a workflow artifact path or an explicit allowed source/test path.`);
  } else {
    const { state, runPath } = currentSummary(root);
    if (state.current_phase !== "executing") {
      blockPreToolUse(`codex-spec: source edits are blocked in phase '${state.current_phase}'. Run $plan and $execute first, or write workflow artifacts under agentflow/ or .agentflow/.`);
    } else if (!runPath) {
      blockPreToolUse("codex-spec: source edits are blocked because .agentflow/state.json has no current_run.");
    } else {
      const gatePath = path.join(runPath, "gate.md");
      const gateResult = readGate(gatePath);
      if (!gateResult.ok) {
        blockPreToolUse(`codex-spec: source edits are blocked because ${path.relative(root, gatePath)} is not an approved gate (${gateResult.reason}).`);
      } else {
        const denied = targets.filter((target) => !isPathAllowedByGate(root, gateResult.gate, target));
        if (denied.length) {
          blockPreToolUse(`codex-spec: source edits are outside the approved gate: ${denied.join(", ")}`);
        } else {
          continueOk();
        }
      }
    }
  }
}
