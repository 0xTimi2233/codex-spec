export async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function jsonOut(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

export function additionalContext(event, text) {
  jsonOut({
    hookSpecificOutput: {
      hookEventName: event,
      additionalContext: text
    }
  });
}

export function blockPreToolUse(reason) {
  jsonOut({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason
    }
  });
}

export function continueOk() {
  jsonOut({ continue: true });
}
