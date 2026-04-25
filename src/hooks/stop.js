import path from "node:path";
import { continueOk, currentSummary, fileExists, jsonOut, missingRunFiles, readStdinJson, resolveRoot } from "./common.js";

const input = await readStdinJson();
const root = resolveRoot(input);
if (!root) {
  continueOk();
} else {
  const { state, runPath } = currentSummary(root);
  if (state.current_phase === "paused") {
    const handoff = path.join(root, ".agentflow", "handoff.md");
    if (!fileExists(handoff)) {
      jsonOut({
        decision: "block",
        reason: "codex-spec: phase 'paused' requires .agentflow/handoff.md. Continue and write the handoff file."
      });
    } else {
      continueOk();
    }
  } else {
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
}
