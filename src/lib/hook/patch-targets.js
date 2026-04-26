export function collectStringValues(value, out = []) {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, out);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStringValues(item, out);
  }
  return out;
}

export function patchTextFromInput(input) {
  if (typeof input === "string") return input;
  for (const key of ["patch", "input", "text", "diff", "content"]) {
    if (typeof input?.[key] === "string" && input[key].includes("*** Begin Patch")) return input[key];
  }
  return collectStringValues(input).find((value) => value.includes("*** Begin Patch")) || "";
}

export function extractPatchTargets(input) {
  const patch = patchTextFromInput(input);
  const matches = [...patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm), ...patch.matchAll(/^\*\*\* Move to: (.+)$/gm)];
  return {
    patch,
    targets: matches.map((match) => match[1].trim()).filter(Boolean)
  };
}
