# ai-fs-permissions

A platform-agnostic security tool that enforces file system permissions for AI agents. Designed to protect sensitive files and folders from unauthorized access by AI coding assistants.

## Why?

When using AI coding assistants like Claude Code, Gemini CLI, or Cursor, you might want to:
- Protect configuration folders (`.centy`, `.claude`, `.github`)
- Make certain files read-only (lock files, configs)
- Block access to sensitive files (`.env`, secrets, keys)
- Allow read but block write to specific paths

This package provides a CLI that can enforce these permissions, working with any AI tool that supports command hooks.

## Installation

```bash
pnpm add -g ai-fs-permissions
```

Or use without installation via `pnpm dlx ai-fs-permissions` or `npx ai-fs-permissions`.

## Quick Start

```bash
# Check if writing to .centy is allowed
ai-fs-permissions --op write --path ".centy/config.json"
# Exit code: 2 (blocked if configured)

# Check if reading is allowed
ai-fs-permissions --op read --path "src/index.ts"
# Exit code: 0 (allowed)

# Show current configuration
ai-fs-permissions --show-config
```

## Configuration

Create `.ai-fs-permissions.yaml` in your project root:

```yaml
version: 1

rules:
  # Protect centy configuration (read-only)
  - path: ".centy/**"
    access: read
    reason: "Configuration folder - modifications may break tooling"

  # Protect AI agent settings
  - path: ".claude/**"
    access: read
    reason: "AI agent settings - must be modified by user only"

  # Block all access to env files
  - path: "**/.env*"
    access: none
    reason: "Environment secrets - sensitive data"

  # Block key files using regex
  - path: "^.*\\.key$"
    type: regex
    access: none
    reason: "Key files contain sensitive credentials"

  # Allow specific file within protected folder (negation)
  - path: "!.centy/user-config.yaml"
    access: readwrite
    reason: "User-editable config"
```

### Access Levels

| Level | Read | Write | Description |
|-------|------|-------|-------------|
| `none` | Blocked | Blocked | Fully blocked |
| `read` | Allowed | Blocked | Read-only |
| `write` | Blocked | Allowed | Write-only (rare) |
| `readwrite` | Allowed | Allowed | Full access |

### Config Discovery

Configs are discovered gitignore-style and merged:

1. `~/.config/ai-fs-permissions/config.yaml` (user defaults)
2. Walk up from cwd to find `.ai-fs-permissions.yaml` (project)
3. `./.ai-fs-permissions.yaml` (current directory, highest priority)

Set `extends: false` in project config to ignore user defaults.

## Platform Integration

### Claude Code

Add to your `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Glob|Grep",
        "hooks": [
          {
            "type": "command",
            "command": "npx ai-fs-permissions --op read"
          }
        ]
      },
      {
        "matcher": "Edit|Write|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "npx ai-fs-permissions --op write"
          }
        ]
      }
    ]
  }
}
```

### Gemini CLI

Add to your `.gemini/settings.json`:

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "read_file",
        "hooks": [
          {
            "type": "command",
            "command": "npx ai-fs-permissions --op read"
          }
        ]
      },
      {
        "matcher": "write_file|edit_file",
        "hooks": [
          {
            "type": "command",
            "command": "npx ai-fs-permissions --op write"
          }
        ]
      }
    ]
  }
}
```

### Cursor

Create `.cursor/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "npx ai-fs-permissions --op write"
      }
    ]
  }
}
```

## CLI Options

```
ai-fs-permissions [options] [path]

Options:
  --op <type>       Operation to check: read, write (required)
  --path <path>     File path to check
  --config <path>   Use specific config file (skip discovery)
  --show-config     Show merged configuration and exit
  --validate        Validate config file and exit
  --help, -h        Show help message
  --version, -v     Show version

Input Methods:
  1. Command line:  ai-fs-permissions --op write --path ".centy/config.json"
  2. Stdin (JSON):  echo '{"tool_input":{"file_path":"..."}}' | ai-fs-permissions --op write
  3. Stdin (plain): echo ".centy/config.json" | ai-fs-permissions --op write
```

## Exit Codes

- `0` - Operation allowed
- `2` - Operation blocked
- `1` - Error occurred

## Blocked Message

When an operation is blocked, a clear message is output to guide the AI agent:

```
PERMISSION DENIED: Writing to '.centy/settings.json' is blocked.

Reason: Configuration folder - modifications may break tooling

This rule is configured by the project owner and cannot be overridden.
Do NOT attempt to:
- Use Bash commands to bypass this restriction
- Suggest workarounds that modify this path
- Ask the user to disable this protection

If this file must be modified, ask the user to do it manually.
```

## License

MIT

## Related Projects

- [block-no-verify](https://github.com/tupe12334/block-no-verify) - Block `--no-verify` flag in git commands
