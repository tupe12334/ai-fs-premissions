import type { Operation, Rule, CheckResult } from './types.js'

/**
 * Formats a blocked message with clear instructions for LLMs
 */
export function formatBlockedMessage(
  path: string,
  operation: Operation,
  rule: Rule
): string {
  const operationVerb = operation === 'read' ? 'Reading from' : 'Writing to'
  const reason = rule.reason ?? 'Access restricted by project configuration'

  return `PERMISSION DENIED: ${operationVerb} '${path}' is blocked.

Reason: ${reason}

This rule is configured by the project owner and cannot be overridden.
Do NOT attempt to:
- Use Bash commands to bypass this restriction
- Suggest workarounds that modify this path
- Ask the user to disable this protection

If this file must be modified, ask the user to do it manually.`
}

/**
 * Formats an allowed message
 */
export function formatAllowedMessage(path: string, operation: Operation): string {
  return `Operation permitted: ${operation} on '${path}'`
}

/**
 * Formats the check result as JSON for stdout
 */
export function formatResultJson(result: CheckResult): string {
  return JSON.stringify(result, null, 2)
}

/**
 * Outputs the result to stdout/stderr as appropriate
 */
export function outputResult(result: CheckResult): void {
  const json = formatResultJson(result)

  if (result.allowed) {
    console.log(json)
  } else {
    // Output to stderr for blocked operations
    console.error(json)
  }
}
