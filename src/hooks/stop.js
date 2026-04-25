import { continueOk, currentSummary, jsonOut, missingRunFiles, readStdinJson, resolveRoot } from "./common.js";

const input = await readStdinJson();
const root = resolveRoot(input);
if (!root) {
  continueOk();
} else {
  const { state, runPath } = currentSummary(root);
  const phasesToCheck = ["ready-to-execute", "ready-to-review", "ready-to-finish", "finishing"];
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
