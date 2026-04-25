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
  const current = exists(out) ? readText(out) : "";
  const modelProfile = current.includes('model_reasoning_effort = "xhigh"') ? "xhigh" : "high";
  const fastMode = current.includes('service_tier = "fast"') ? "on" : "off";
  const rendered = renderConfigToml(readText(tpl), context.packageRoot, { modelProfile, fastMode });
  writeText(out, rendered, { force: true });
  println(`Rebound hooks in ${out}`);
}
