/**
 * Access levels for file permissions
 */
export type AccessLevel = 'none' | 'read' | 'write' | 'readwrite'

/**
 * Operation types that can be checked
 */
export type Operation = 'read' | 'write'

/**
 * Pattern type for matching paths
 */
export type PatternType = 'glob' | 'regex'

/**
 * A single permission rule
 */
export interface Rule {
  /** Path pattern to match */
  path: string
  /** Pattern type (default: glob) */
  type: PatternType
  /** Access level for this path */
  access: AccessLevel
  /** Human-readable reason for this rule */
  reason?: string
  /** Whether this is a negation rule (starts with !) */
  negated: boolean
}

/**
 * Configuration file structure
 */
export interface Config {
  /** Config version */
  version: number
  /** Whether to extend user config (default: true) */
  extends: boolean
  /** Permission rules */
  rules: Rule[]
}

/**
 * Result of a permission check
 */
export interface CheckResult {
  /** Whether the operation is allowed */
  allowed: boolean
  /** The path that was checked */
  path: string
  /** The operation that was checked */
  operation: Operation
  /** The rule that matched (if any) */
  rule?: string
  /** The access level of the matching rule */
  access?: AccessLevel
  /** Human-readable message */
  message: string
}

/**
 * Tool name to operation mapping
 */
export const TOOL_OPERATIONS: Record<string, Operation> = {
  Read: 'read',
  Glob: 'read',
  Grep: 'read',
  Edit: 'write',
  Write: 'write',
  NotebookEdit: 'write',
}
