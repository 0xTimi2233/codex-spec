#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.js";
import { findPackageRoot, resolveTarget } from "./lib/paths.js";
import { printHelp } from "./commands/help.js";
import { initCommand } from "./commands/init.js";
import { healthCommand } from "./commands/health.js";
import { statusCommand } from "./commands/status.js";
import { rebindHooksCommand } from "./commands/rebind-hooks.js";
import { stateCommand } from "./commands/state.js";
import { backupCommand } from "./commands/backup.js";
import { exitWith, println } from "./lib/output.js";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || (args.version ? "version" : args.help ? "help" : null);
const packageRoot = findPackageRoot(import.meta.url);
const context = { packageRoot, target: resolveTarget(args) };

if (!command || command === "help" || args.help) {
  printHelp(args._[1]);
} else if (command === "init") {
  initCommand(args, context);
} else if (command === "health") {
  healthCommand(args, context);
} else if (command === "status") {
  statusCommand(args, context);
} else if (command === "rebind-hooks") {
  rebindHooksCommand(args, context);
} else if (command === "state") {
  stateCommand(args, context);
} else if (command === "backup") {
  backupCommand(args, context);
} else if (command === "--version" || command === "version") {
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  println(pkg.version);
} else {
  exitWith(`Unknown command: ${command}\nRun: codex-spec help`);
}
