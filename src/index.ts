/**
 * ai-fs-permissions
 *
 * A platform-agnostic security tool that enforces file system permissions
 * for AI agents. Protects sensitive files and folders from unauthorized access.
 */

// Types
export type {
  AccessLevel,
  Operation,
  PatternType,
  Rule,
  Config,
  CheckResult,
} from './types.js'

export { TOOL_OPERATIONS } from './types.js'

// Exit codes
export { EXIT_CODES } from './exit-codes.js'

// Config
export { loadConfig, loadConfigFile, findConfigFile } from './config/loader.js'
export { ConfigSchema, RuleSchema } from './config/schema.js'

// Matchers
export { matchPath, matchGlob, matchRegex } from './matcher/index.js'

// Core
export { checkPermission } from './checker.js'

// Output
export {
  formatBlockedMessage,
  formatAllowedMessage,
  formatResultJson,
  outputResult,
} from './output.js'

// Stdin
export { parseStdin, readStdin } from './stdin.js'
