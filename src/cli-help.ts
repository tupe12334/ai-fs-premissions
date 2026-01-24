export const HELP_TEXT = `ai-fs-permissions - File system permissions for AI agents

USAGE
  ai-fs-permissions [options] [path]

OPTIONS
  --op <type>       Operation to check: read, write (required unless using stdin)
  --path <path>     File path to check (can also be positional argument)
  --config <path>   Use specific config file (skip discovery)
  --show-config     Show merged configuration and exit
  --validate        Validate config file and exit
  --help, -h        Show this help message
  --version, -v     Show version

INPUT METHODS
  1. Command line:    ai-fs-permissions --op write --path ".centy/config.json"
  2. Stdin (JSON):    echo '{"tool_input":{"file_path":".centy/x"}}' | ai-fs-permissions --op write
  3. Stdin (plain):   echo ".centy/config.json" | ai-fs-permissions --op write

CONFIG FILE (.ai-fs-permissions.yaml)
  version: 1
  rules:
    - path: ".centy/**"
      access: read
      reason: "Configuration folder"
    - path: "**/.env*"
      access: none
      reason: "Environment secrets"

ACCESS LEVELS
  none       Block all access (read and write)
  read       Allow read, block write
  write      Allow write, block read
  readwrite  Allow both read and write

EXIT CODES
  0          Operation allowed
  2          Operation blocked
  1          Error (invalid config, missing arguments, etc.)

EXAMPLES
  # Check if writing to .centy is allowed
  ai-fs-permissions --op write --path ".centy/settings.json"

  # Use with Claude Code hooks (stdin JSON)
  echo '{"tool_input":{"file_path":"src/index.ts"}}' | ai-fs-permissions --op write

  # Show merged config for debugging
  ai-fs-permissions --show-config

  # Validate config file
  ai-fs-permissions --validate
`
