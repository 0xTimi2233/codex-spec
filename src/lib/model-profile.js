const MODEL = "gpt-5.5";
const HIGH_REVIEW_ROLES = ["pm", "architect", "doc-reviewer", "code-reviewer"];

const FAST_MODES = {
  off: {},
  on: { serviceTier: "fast" }
};

const MODEL_PROFILES = {
  high: {
    main: { model: MODEL, reasoning: "xhigh" },
    agents: {
      default: { model: MODEL, reasoning: "high" },
      roles: Object.fromEntries(HIGH_REVIEW_ROLES.map((role) => [role, { model: MODEL, reasoning: "xhigh" }]))
    }
  },
  xhigh: {
    main: { model: MODEL, reasoning: "xhigh" },
    agents: {
      default: { model: MODEL, reasoning: "xhigh" },
      roles: {}
    }
  }
};

function choice(value, fallback, options, errorMessage) {
  const normalized = String(value || fallback).trim().toLowerCase();
  if (!Object.hasOwn(options, normalized)) throw new Error(errorMessage(value));
  return normalized;
}

function renderModelBlock({ model, reasoning, serviceTier = null }) {
  const lines = [`model = "${model}"`, `model_reasoning_effort = "${reasoning}"`];
  if (serviceTier) lines.push(`service_tier = "${serviceTier}"`);
  return lines.join("\n");
}

export function normalizeModelProfile(value = "high") {
  return choice(value, "high", MODEL_PROFILES, (raw) => `Unsupported model profile: ${raw}. Use --model high or --model xhigh.`);
}

export function normalizeFastMode(value = "off") {
  if (value === true) return "on";
  return choice(value, "off", FAST_MODES, (raw) => `Unsupported fast mode: ${raw}. Use --fast on or --fast off.`);
}

export function renderRootModelConfig(profile, fastMode) {
  const modelConfig = MODEL_PROFILES[normalizeModelProfile(profile)].main;
  const fastConfig = FAST_MODES[normalizeFastMode(fastMode)];
  return renderModelBlock({ ...modelConfig, serviceTier: fastConfig.serviceTier });
}

export function renderAgentModelConfig(role, profile, fastMode = "off") {
  const agentConfig = MODEL_PROFILES[normalizeModelProfile(profile)].agents;
  const fastConfig = FAST_MODES[normalizeFastMode(fastMode)];
  return `${renderModelBlock({ ...(agentConfig.roles[role] || agentConfig.default), serviceTier: fastConfig.serviceTier })}\n`;
}
