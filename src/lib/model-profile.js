const MODEL = "gpt-5.5";
const MODEL_PROFILES = new Set(["middle", "high", "xhigh"]);
const FAST_MODES = new Set(["on", "off"]);
const HIGH_PROFILE_XHIGH_ROLES = new Set(["architect", "doc-reviewer", "code-reviewer"]);

export function normalizeModelProfile(value = "middle") {
  const profile = String(value || "middle").trim().toLowerCase();
  if (!MODEL_PROFILES.has(profile)) {
    throw new Error(`Unsupported model profile: ${value}. Use --model middle, --model high, or --model xhigh.`);
  }
  return profile;
}

export function normalizeFastMode(value = "off") {
  if (value === true) return "on";
  const mode = String(value || "off").trim().toLowerCase();
  if (!FAST_MODES.has(mode)) {
    throw new Error(`Unsupported fast mode: ${value}. Use --fast on or --fast off.`);
  }
  return mode;
}

export function renderRootModelConfig(profile, fastMode) {
  const reasoning = profile === "xhigh" ? "xhigh" : "high";
  const lines = [`model = "${MODEL}"`, `model_reasoning_effort = "${reasoning}"`];
  if (fastMode === "on") lines.push('service_tier = "fast"');
  return lines.join("\n");
}

export function renderAgentModelConfig(role, profile) {
  if (profile !== "high" || !HIGH_PROFILE_XHIGH_ROLES.has(role)) return "";
  return `model = "${MODEL}"\nmodel_reasoning_effort = "xhigh"\n`;
}
