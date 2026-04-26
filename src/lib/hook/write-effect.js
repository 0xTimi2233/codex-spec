import { analyzeShellWrite } from "./shell-write.js";
import { collectStringValues, extractPatchTargets } from "./patch-targets.js";

const DIRECT_FILE_TOOLS = new Set(["Write", "Edit"]);

function explicitFileTargets(input) {
  return collectStringValues({
    file_path: input.file_path,
    path: input.path,
    filename: input.filename,
    target_file: input.target_file
  }).filter(Boolean);
}

export function analyzeWriteEffect(tool, toolInput) {
  const input = toolInput || {};
  if (DIRECT_FILE_TOOLS.has(tool)) {
    return {
      writes: true,
      ambiguous: false,
      targets: explicitFileTargets(input)
    };
  }
  if (tool === "apply_patch") {
    const { patch, targets } = extractPatchTargets(input);
    return {
      writes: true,
      ambiguous: !patch || !targets.length,
      targets
    };
  }
  if (tool === "Bash") {
    const cmd = String(input.command || input.cmd || "");
    return analyzeShellWrite(cmd);
  }
  return { writes: false, ambiguous: false, targets: [] };
}
