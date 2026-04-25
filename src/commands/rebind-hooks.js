import path from "node:path";
import { templateRoot, renderConfigToml } from "../lib/templates.js";
import { exists, readText, writeText } from "../lib/fs.js";
import { println, exitWith } from "../lib/output.js";

export function rebindHooksCommand(args, context) {
  const lang = String(args.lang || "en").toLowerCase() === "zh" ? "zh" : "en";
  const tpl = path.join(templateRoot(context.packageRoot, lang), ".codex", "config.toml.tpl");
  if (!exists(tpl)) {
    exitWith(`Config template not found: ${tpl}`);
    return;
  }
  const out = path.join(context.target, ".codex", "config.toml");
  const rendered = renderConfigToml(readText(tpl), context.packageRoot);
  writeText(out, rendered, { force: true });
  println(`Rebound hooks in ${out}`);
}
