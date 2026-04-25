import path from "node:path";
import { copyTemplate, renderConfigToml, templateRoot } from "../lib/templates.js";
import { ensureDir, exists, readText, writeText } from "../lib/fs.js";
import { println, exitWith } from "../lib/output.js";

export function initCommand(args, context) {
  const lang = String(args.lang || "en").toLowerCase();
  if (!["en", "zh"].includes(lang)) {
    exitWith(`Unsupported language: ${lang}. Use --lang en or --lang zh.`);
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
  const copied = copyTemplate({ packageRoot: context.packageRoot, targetRoot: target, lang, force });

  const cfgTpl = path.join(src, ".codex", "config.toml.tpl");
  const cfgOut = path.join(target, ".codex", "config.toml");
  if (exists(cfgTpl)) {
    const rendered = renderConfigToml(readText(cfgTpl), context.packageRoot);
    writeText(cfgOut, rendered, { force });
  }

  for (const rel of [".agentflow/runs/.gitkeep", ".agentflow/backups/.gitkeep"]) {
    const p = path.join(target, rel);
    if (!exists(p)) writeText(p, "", { force: false });
  }

  println(`Initialized codex-spec workflow in ${target}`);
  println(`Language: ${lang}`);
  println(`Files created or updated: ${copied.length}`);
  if (!force) println("Existing files were preserved. Use --force to overwrite generated files.");
}
