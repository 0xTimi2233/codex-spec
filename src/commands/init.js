import path from "node:path";
import { copyTemplate, renderConfigToml, templateRoot } from "../lib/templates.js";
import { ensureDir, exists, readText, writeText } from "../lib/fs.js";
import { findInitConflicts, resolveOverwriteChoice, shouldPreserveInitTarget } from "../lib/init-plan.js";
import { normalizeFastMode, normalizeModelProfile } from "../lib/model-profile.js";
import { println, exitWith } from "../lib/output.js";

export async function initCommand(args, context) {
  const lang = String(args.lang || "en").toLowerCase();
  if (!["en", "zh"].includes(lang)) {
    exitWith(`Unsupported language: ${lang}. Use --lang en or --lang zh.`);
    return;
  }
  let modelProfile;
  let fastMode;
  try {
    modelProfile = normalizeModelProfile(args.model);
    fastMode = normalizeFastMode(args.fast);
  } catch (error) {
    exitWith(error.message);
    return;
  }
  const target = context.target;
  const force = Boolean(args.force);
  const src = templateRoot(context.packageRoot, lang);
  if (!exists(src)) {
    exitWith(`Template not found: ${src}`);
    return;
  }
  ensureDir(target);
  const conflicts = force ? [] : findInitConflicts({ packageRoot: context.packageRoot, target, lang });
  const overwriteGenerated = await resolveOverwriteChoice({ conflicts, force, print: println });
  const copied = copyTemplate({
    packageRoot: context.packageRoot,
    targetRoot: target,
    lang,
    force: overwriteGenerated,
    modelProfile,
    fastMode,
    preserveExisting: (dstPath) => shouldPreserveInitTarget(target, dstPath)
  });

  const cfgTpl = path.join(src, ".codex", "config.toml.tpl");
  const cfgOut = path.join(target, ".codex", "config.toml");
  if (exists(cfgTpl)) {
    const rendered = renderConfigToml(readText(cfgTpl), context.packageRoot, { modelProfile, fastMode });
    writeText(cfgOut, rendered, { force: overwriteGenerated });
  }

  for (const rel of [".agentflow/brainstorm/.gitkeep", ".agentflow/runs/.gitkeep", ".agentflow/archives/.gitkeep"]) {
    const p = path.join(target, rel);
    if (!exists(p)) writeText(p, "", { force: false });
  }

  println(`Initialized codex-spec workflow in ${target}`);
  println(`Language: ${lang}`);
  println(`Model profile: ${modelProfile}`);
  println(`Fast mode: ${fastMode}`);
  println(`Files created or updated: ${copied.length}`);
  if (conflicts.length && !overwriteGenerated) println("Existing generated files were preserved. Use --force or answer y to overwrite generated non-agentflow files.");
  if (overwriteGenerated) println("Existing agentflow/ and .agentflow/ files were preserved.");
}
