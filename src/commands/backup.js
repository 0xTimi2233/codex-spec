import path from "node:path";
import { spawnSync } from "node:child_process";
import { ensureDir, writeText } from "../lib/fs.js";
import { println, exitWith } from "../lib/output.js";

function safeLabel(label) {
  return String(label || "backup").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "backup";
}

export function backupCommand(args, context) {
  const label = safeLabel(args.label);
  if (!label) {
    exitWith("Usage: codex-spec backup --label <label>");
    return;
  }
  const dir = path.join(context.target, ".agentflow", "backups");
  ensureDir(dir);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(dir, `${ts}-${label}.patch`);
  const diff = spawnSync("git", ["diff", "--binary"], { cwd: context.target, encoding: "utf8" });
  const content = diff.status === 0 && diff.stdout.trim()
    ? diff.stdout
    : `# codex-spec backup\n\nNo git diff was available.\n\nCreated at: ${new Date().toISOString()}\n`;
  writeText(file, content, { force: true });
  println(`Backup written: ${file}`);
}
