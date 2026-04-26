import { currentSummary, resolveRoot } from "../lib/hook/context.js";
import { continueOk, jsonOut, readStdinJson } from "../lib/hook/io.js";
import { missingRunFiles } from "../lib/hook/workflow-files.js";

const input = await readStdinJson();
const root = resolveRoot(input);
if (!root) {
  continueOk();
} else {
  const { state, runPath } = currentSummary(root);
  const phasesToCheck = [
    "planning",
    "designing",
    "doc-reviewing",
    "ready-to-execute",
    "executing",
    "code-reviewing",
    "ready-to-finish",
    "finishing",
    "blocked"
  ];
  if (phasesToCheck.includes(state.current_phase)) {
    const missing = missingRunFiles(root, runPath, state.current_phase);
    if (missing.length) {
      jsonOut({
        decision: "block",
        reason: `codex-spec: phase '${state.current_phase}' is missing required artifact(s): ${missing.join(", ")}. Continue and write the required file(s).`
      });
    } else {
      continueOk();
    }
  } else {
    continueOk();
  }
}
