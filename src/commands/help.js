import { println } from "../lib/output.js";
import { PHASES } from "../lib/state.js";

const COMMANDS = {
  init: `codex-spec init [--lang en|zh] [--model high|xhigh] [--fast off|on] [--target <dir>] [--force]\n\nCreate project-local Codex workflow files. Default language is English. Default model profile is high and fast mode is off.`,
  doctor: `codex-spec doctor [--target <dir>]\n\nCheck required workflow files and hook script paths.`,
  status: `codex-spec status [--target <dir>]\n\nPrint .agentflow/state.json, current run dispatch ledger, and current run summary.`,
  "rebind-hooks": `codex-spec rebind-hooks [--target <dir>] [--lang en|zh]\n\nRewrite .codex/config.toml hook commands to the current installed script paths.`,
  state: `codex-spec state set --phase <phase> [--mode <mode>] [--run <run-id>] [--milestone <id>] [--blocked true|false]\n\nAllowed phases:\n  ${PHASES.join("\n  ")}`,
  archive: `codex-spec archive --run <run-id> [--target <dir>] [--force]\n\nCopy .agentflow/runs/<run-id>/ into .agentflow/archives/<run-id>/.`
};

export function printHelp(command = null) {
  if (command && COMMANDS[command]) {
    println(COMMANDS[command]);
    return;
  }
  println(`codex-spec\n\nUsage:\n  codex-spec help [command]\n  codex-spec init [--lang en|zh] [--model high|xhigh] [--fast off|on] [--target <dir>] [--force]\n  codex-spec doctor [--target <dir>]\n  codex-spec status [--target <dir>]\n\nCommands:\n  init    Create AGENTS.md, .codex, .agents, agentflow, and .agentflow.\n  doctor  Validate workflow scaffold and hook paths.\n  status  Show current workflow state.\n  help    Show command help.\n\nWorkflow phases:\n  ${PHASES.join(" -> ")}\n`);
}
