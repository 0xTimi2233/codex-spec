{{MODEL_PROFILE_CONFIG}}

[features]
codex_hooks = true

[agents]
max_threads = 8
max_depth = 1

[[hooks.UserPromptSubmit]]
[[hooks.UserPromptSubmit.hooks]]
type = "command"
command = {{HOOK_USER_PROMPT_SUBMIT}}
timeout = 30
statusMessage = "Loading agentflow state"

[[hooks.PreToolUse]]
matcher = "Bash|apply_patch|Edit|Write"
[[hooks.PreToolUse.hooks]]
type = "command"
command = {{HOOK_PRE_TOOL_USE}}
timeout = 30
statusMessage = "Checking agentflow gate"

[[hooks.PostToolUse]]
matcher = "Bash|apply_patch|Edit|Write"
[[hooks.PostToolUse.hooks]]
type = "command"
command = {{HOOK_POST_TOOL_USE}}
timeout = 30
statusMessage = "Reviewing tool result"

[[hooks.Stop]]
[[hooks.Stop.hooks]]
type = "command"
command = {{HOOK_STOP}}
timeout = 30
statusMessage = "Checking completion artifacts"
