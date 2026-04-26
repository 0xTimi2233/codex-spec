const MODEL = "gpt-5.5";
const MODEL_PROFILES = new Set(["high", "xhigh"]);
const FAST_MODES = new Set(["on", "off"]);
const HIGH_PROFILE_XHIGH_ROLES = new Set(["pm", "architect", "doc-reviewer", "code-reviewer"]);

export function normalizeModelProfile(value = "high") {
  const profile = String(value || "high").trim().toLowerCase();
  if (!MODEL_PROFILES.has(profile)) {
    throw new Error(`Unsupported model profile: ${value}. Use --model high or --model xhigh.`);
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
  const lines = [`model = "${MODEL}"`, `model_reasoning_effort = "xhigh"`];
  if (fastMode === "on") lines.push('service_tier = "fast"');
  return lines.join("\n");
}

export function renderAgentModelConfig(role, profile) {
  const reasoning = profile === "xhigh" || HIGH_PROFILE_XHIGH_ROLES.has(role) ? "xhigh" : "high";
  return `model = "${MODEL}"\nmodel_reasoning_effort = "${reasoning}"\n`;
}
