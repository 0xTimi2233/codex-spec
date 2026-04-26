#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.js";
import { findPackageRoot, resolveTarget } from "./lib/paths.js";
import { printHelp } from "./commands/help.js";
import { initCommand } from "./commands/init.js";
import { doctorCommand } from "./commands/doctor.js";
import { statusCommand } from "./commands/status.js";
import { stateCommand } from "./commands/state.js";
import { archiveCommand } from "./commands/archive.js";
import { exitWith, println } from "./lib/output.js";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || (args.version ? "version" : args.help ? "help" : null);
const packageRoot = findPackageRoot(import.meta.url);
const context = { packageRoot, target: resolveTarget(args) };

if (!command || command === "help" || args.help) {
  printHelp(args._[1]);
} else if (command === "init") {
  await initCommand(args, context);
} else if (command === "doctor") {
  doctorCommand(args, context);
} else if (command === "status") {
  statusCommand(args, context);
} else if (command === "state") {
  stateCommand(args, context);
} else if (command === "archive") {
  archiveCommand(args, context);
} else if (command === "--version" || command === "version") {
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  println(pkg.version);
} else {
  exitWith(`Unknown command: ${command}\nRun: codex-spec help`);
}
