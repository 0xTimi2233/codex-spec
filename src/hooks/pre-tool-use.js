import path from "node:path";
import { isPathAllowedByGate, normalizeRepoPath, readGate } from "../lib/gate.js";
import { currentSummary, resolveRoot } from "../lib/hook/context.js";
import { blockPreToolUse, continueOk, readStdinJson } from "../lib/hook/io.js";
import { analyzeWriteEffect } from "../lib/hook/write-effect.js";
import { isWorkflowPath } from "../lib/hook/workflow-files.js";

const input = await readStdinJson();
const root = resolveRoot(input);

if (!root) {
  continueOk();
} else {
  const tool = input.tool_name || "";
  const writes = /^(Write|Edit|apply_patch|Bash)$/.test(tool);
  const effect = writes ? analyzeWriteEffect(tool, input.tool_input) : { writes: false, ambiguous: false, targets: [] };
  const targets = effect.targets || [];
  const normalizedTargets = targets.map((target) => normalizeRepoPath(root, target));

  if (!writes || !effect.writes) {
    continueOk();
  } else if (effect.ambiguous) {
    blockPreToolUse(`codex-spec: ${tool} may write files but the target path is ambiguous. Use Write/Edit/apply_patch or an explicit allowed path.`);
  } else if (normalizedTargets.some((target) => !target)) {
    blockPreToolUse(`codex-spec: ${tool} target is outside the project root or invalid: ${targets.join(", ")}`);
  } else if (normalizedTargets.length && normalizedTargets.every((target) => isWorkflowPath(root, target))) {
    continueOk();
  } else if (!normalizedTargets.length) {
    blockPreToolUse(`codex-spec: ${tool} write target could not be identified. Use a workflow artifact path or an explicit allowed source/test path.`);
  } else {
    const { state, runPath } = currentSummary(root);
    const workflowActive = Boolean(state.current_run) || state.current_phase !== "idle" || state.blocked;
    if (!workflowActive) {
      continueOk();
    } else if (state.current_phase !== "executing") {
      blockPreToolUse(`codex-spec: source edits are blocked in phase '${state.current_phase}'. Run $plan and $execute first, or write workflow artifacts under agentflow/ or .agentflow/.`);
    } else if (!runPath) {
      blockPreToolUse("codex-spec: source edits are blocked because .agentflow/state.json has no current_run.");
    } else {
      const gatePath = path.join(runPath, "gate.md");
      const gateResult = readGate(gatePath);
      if (!gateResult.ok) {
        blockPreToolUse(`codex-spec: source edits are blocked because ${path.relative(root, gatePath)} is not an approved gate (${gateResult.reason}).`);
      } else {
        const denied = normalizedTargets.filter((target) => !isPathAllowedByGate(root, gateResult.gate, target));
        if (denied.length) {
          blockPreToolUse(`codex-spec: source edits are outside the approved gate: ${denied.join(", ")}`);
        } else {
          continueOk();
        }
      }
    }
  }
}
