import path from "node:path";
import { createInterface } from "node:readline/promises";
import { exists } from "./fs.js";
import { listTemplateOutputs } from "./templates.js";

function normalizeRel(rel) {
  return rel.replaceAll(path.sep, "/").replace(/^\.\/+/, "");
}

export function isAgentflowArtifact(rel) {
  const normalized = normalizeRel(rel);
  return normalized.startsWith("agentflow/") || normalized.startsWith(".agentflow/");
}

export function findInitConflicts({ packageRoot, target, lang }) {
  return listTemplateOutputs(packageRoot, lang)
    .filter((rel) => !isAgentflowArtifact(rel))
    .filter((rel) => exists(path.join(target, rel)));
}

export function shouldPreserveInitTarget(target, dstPath) {
  return isAgentflowArtifact(path.relative(target, dstPath)) && exists(dstPath);
}

export async function resolveOverwriteChoice({ conflicts, force, input = process.stdin, output = process.stdout, print = () => {} }) {
  if (force) return true;
  if (!conflicts.length || !input.isTTY) return false;

  print("codex-spec init found existing generated files:");
  for (const rel of conflicts.slice(0, 20)) print(`- ${rel}`);
  if (conflicts.length > 20) print(`- ...and ${conflicts.length - 20} more`);

  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question("Overwrite these files? [y/N] ");
    return ["y", "yes"].includes(answer.trim().toLowerCase());
  } finally {
    rl.close();
  }
}
