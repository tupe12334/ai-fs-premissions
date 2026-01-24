import type { Config, Rule, Operation, AccessLevel, CheckResult } from './types.js'
import { matchPath } from './matcher/index.js'
import { formatBlockedMessage, formatAllowedMessage } from './output.js'

/**
 * Checks if an access level allows the given operation
 */
function isOperationAllowed(access: AccessLevel, operation: Operation): boolean {
  switch (access) {
    case 'none':
      return false
    case 'read':
      return operation === 'read'
    case 'write':
      return operation === 'write'
    case 'readwrite':
      return true
    default:
      return true
  }
}

/**
 * Finds the matching rule for a path
 * Rules are evaluated in order, with later rules overriding earlier ones
 * Negation rules (!) grant access back
 */
function findMatchingRule(
  rules: Rule[],
  filePath: string
): { rule: Rule; index: number } | null {
  let lastMatch: { rule: Rule; index: number } | null = null

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (matchPath(rule.path, rule.type, filePath)) {
      lastMatch = { rule, index: i }
    }
  }

  return lastMatch
}

/**
 * Checks if an operation on a path is allowed
 */
export function checkPermission(
  config: Config,
  filePath: string,
  operation: Operation
): CheckResult {
  // Normalize path (remove leading ./ if present)
  const normalizedPath = filePath.replace(/^\.\//, '')

  // Find matching rule
  const match = findMatchingRule(config.rules, normalizedPath)

  // No matching rule = passthrough (allowed)
  if (match === null) {
    return {
      allowed: true,
      path: normalizedPath,
      operation,
      message: formatAllowedMessage(normalizedPath, operation),
    }
  }

  const { rule } = match

  // Negation rules grant access back
  if (rule.negated) {
    return {
      allowed: true,
      path: normalizedPath,
      operation,
      rule: `!${rule.path}`,
      access: rule.access,
      message: formatAllowedMessage(normalizedPath, operation),
    }
  }

  // Check if operation is allowed by the access level
  const allowed = isOperationAllowed(rule.access, operation)

  if (allowed) {
    return {
      allowed: true,
      path: normalizedPath,
      operation,
      rule: rule.path,
      access: rule.access,
      message: formatAllowedMessage(normalizedPath, operation),
    }
  }

  // Operation is blocked
  return {
    allowed: false,
    path: normalizedPath,
    operation,
    rule: rule.path,
    access: rule.access,
    message: formatBlockedMessage(normalizedPath, operation, rule),
  }
}
