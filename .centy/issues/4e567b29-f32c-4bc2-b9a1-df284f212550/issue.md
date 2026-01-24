# # Problem Statement

AI agents can read/write/delete any file. Project owners may want to:
- Protect config folders (`.centy`, `.claude`, `.github`)
- Make certain files read-only (lock files, configs)
- Block access to sensitive files (`.env`, secrets)
- Allow read but block write to specific paths

## Design Decisions

### Configuration

- **Format**: YAML
- **Default behavior**: If a path is not specified in rules, skip the check (passthrough to agent's default behavior)
- **Pattern support**: Both glob (gitignore-style) and regex patterns
- **Integration**: Hook systems like block-no-verify (stdin JSON, exit codes)

### Config Discovery (gitignore-style)

```
Search order (merged, later overrides):
1. ~/.config/ai-fs-permissions/config.yaml   (user defaults)
2. Walk up from cwd to find .ai-fs-permissions.yaml (project)
3. ./.ai-fs-permissions.yaml                  (current dir, highest priority)
```

### Config File: `.ai-fs-permissions.yaml`

```yaml
version: 1

# Optional: extend/override user config
extends: true  # default: true, set false to ignore ~/.config

rules:
  # Simple glob (gitignore-style)
  - path: ".centy/**"
    access: read
    reason: "Configuration folder - modifications may break tooling"

  - path: ".claude/**"
    access: read
    reason: "AI agent settings - must be modified by user only"

  - path: "**/.env*"
    access: none
    reason: "Environment secrets - sensitive data"

  - path: "pnpm-lock.yaml"
    access: read
    reason: "Lock file - use pnpm install to modify"

  # Regex pattern
  - path: "^.*\\.key$"
    type: regex
    access: none
    reason: "Key files are sensitive"

  # Negation (like gitignore !)
  - path: "!.centy/user-config.yaml"
    access: readwrite
    reason: "User-editable config within .centy"
```

### Access Levels

| Level | Read | Write | Description |
|-------|------|-------|-------------|
| `none` | No | No | Fully blocked |
| `read` | Yes | No | Read-only |
| `write` | No | Yes | Write-only (rare use case) |
| `readwrite` | Yes | Yes | Full access |
| (not specified) | Yes | Yes | Passthrough (default) |

### Output Format (always JSON)

**Allowed:**
```json
{
  "allowed": true,
  "path": "src/index.ts",
  "operation": "write",
  "message": "Operation permitted"
}
```

**Blocked:**
```json
{
  "allowed": false,
  "path": ".centy/settings.json",
  "operation": "write",
  "rule": ".centy/**",
  "access": "read",
  "message": "PERMISSION DENIED: Writing to '.centy/settings.json' is blocked.\n\nReason: Configuration folder - modifications may break tooling\n\nThis rule is configured by the project owner and cannot be overridden.\nDo NOT attempt to bypass this restriction or use alternative methods.\nIf you need this file modified, ask the user to do it manually."
}
```

### LLM-Directed Message Template

```
PERMISSION DENIED: {operation} to '{path}' is blocked.

Reason: {reason}

This rule is configured by the project owner and cannot be overridden.
Do NOT attempt to:
- Use Bash commands to bypass this restriction
- Suggest workarounds that modify this path
- Ask the user to disable this protection

If this file must be modified, ask the user to do it manually.
```

### CLI Interface

```bash
# Via stdin (hook mode - auto-detects tool format)
echo '{"tool_input":{"file_path":".centy/x"}}' | ai-fs-permissions --op write

# Direct path check
ai-fs-permissions --op read --path ".centy/config.json"

# Show merged config (debug)
ai-fs-permissions --show-config

# Validate config file
ai-fs-permissions --validate

# Specify config explicitly (skip discovery)
ai-fs-permissions --config ./custom.yaml --op write --path "foo.txt"
```

### Exit Codes (same as block-no-verify)
- `0` - Allowed
- `2` - Blocked
- `1` - Error (invalid config, parse error, etc.)

### Tool to Operation Mapping

```yaml
# Built-in mapping (no bash for now)
tool_operations:
  Read: read
  Glob: read
  Grep: read
  Edit: write
  Write: write
  NotebookEdit: write
  # Bash: future - will parse commands
```

### Hook Integration Example (Claude Code)

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

## Project Structure

```
ai-fs-permissions/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── config/
│   │   ├── discovery.ts    # Find configs (gitignore-style walk)
│   │   ├── loader.ts       # YAML parsing
│   │   ├── merger.ts       # Merge user + project configs
│   │   └── schema.ts       # Zod validation
│   ├── matcher/
│   │   ├── index.ts        # Matcher factory
│   │   ├── glob.ts         # Glob/gitignore patterns
│   │   └── regex.ts        # Regex patterns
│   ├── checker.ts          # Core permission logic
│   ├── output.ts           # JSON output formatting
│   └── stdin.ts            # Parse hook stdin formats
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Implementation Order

1. Config schema + loader (Zod validation, YAML parsing)
2. Glob/regex matching
3. Core checker logic
4. CLI + stdin parsing
5. Output formatting (JSON with LLM message)
6. Config discovery (gitignore-style directory walk)
7. Config merging (user + project configs)
8. Tests

## Future Enhancements (Out of Scope for v1)

- **Bash command parsing**: Analyze bash commands to detect file operations (`rm`, `mv`, `cp`, `cat >`, `sed -i`, etc.)
- **Gemini CLI integration**: Hook configuration for Gemini CLI
- **Cursor integration**: Hook configuration for Cursor
- **Wildcard negation patterns**: More advanced gitignore-style patterns

## References

- [block-no-verify](https://github.com/tupe12334/block-no-verify) - Similar tool for blocking `--no-verify` flag
- [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code)
- [Gemini CLI Hooks](https://geminicli.com/docs/hooks/)
- [Cursor Hooks](https://cursor.com/docs/agent/hooks)
