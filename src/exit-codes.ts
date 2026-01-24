/**
 * Exit codes for the CLI
 */
export const EXIT_CODES = {
  /** Operation is allowed to proceed */
  ALLOWED: 0,
  /** Operation is blocked */
  BLOCKED: 2,
  /** An error occurred */
  ERROR: 1,
} as const
