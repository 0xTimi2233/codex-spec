import { println } from "../lib/output.js";
import { PHASES } from "../lib/state.js";

const COMMANDS = {
  init: `codex-spec init [--lang en|zh] [--model high|xhigh] [--fast off|on] [--target <dir>] [--force]\n\nCreate project-local Codex workflow files. Default language is English. Default model profile is high and fast mode is off. Existing generated files are preserved by default; interactive runs ask before overwriting non-agentflow files. Existing agentflow/ and .agentflow/ files are never overwritten.`,
  doctor: `codex-spec doctor [--target <dir>]\n\nCheck required workflow scaffold files.`,
  status: `codex-spec status [--target <dir>]\n\nPrint .agentflow/state.json, current run dispatch ledger, and current run summary.`,
  profile: `codex-spec profile [--model high|xhigh] [--fast off|on] [--target <dir>]\n\nShow or update project-level and subagent model profile settings.`,
  state: `codex-spec state set [--phase <phase>] [--mode <mode>] [--brainstorm <id>] [--run <run-id>] [--milestone <id>] [--blocked true|false]\n\nAllowed phases:\n  ${PHASES.join("\n  ")}`,
  archive: `codex-spec archive --run <run-id> [--target <dir>]\ncodex-spec archive --brainstorm <brainstorm-id> [--target <dir>]\n\nMove run or brainstorm artifacts into immutable .agentflow/archives/.`
};

export function printHelp(command = null) {
  if (command && COMMANDS[command]) {
    println(COMMANDS[command]);
    return;
  }
  println(`codex-spec\n\nUsage:\n  codex-spec help [command]\n  codex-spec init [--lang en|zh] [--model high|xhigh] [--fast off|on] [--target <dir>] [--force]\n  codex-spec profile [--model high|xhigh] [--fast off|on] [--target <dir>]\n  codex-spec doctor [--target <dir>]\n  codex-spec status [--target <dir>]\n\nCommands:\n  init     Create AGENTS.md, .codex, .agents, agentflow, and .agentflow.\n  profile  Show or update model profile and fast mode.\n  doctor   Validate workflow scaffold files.\n  status   Show current workflow state.\n  help     Show command help.\n\nWorkflow phases:\n  ${PHASES.join(" -> ")}\n`);
}
