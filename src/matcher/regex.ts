/**
 * Tests if a path matches a regex pattern
 */
export function matchRegex(pattern: string, filePath: string): boolean {
  try {
    const regex = new RegExp(pattern)
    // Normalize path separators for consistent matching
    const normalizedPath = filePath.replace(/\\/g, '/')
    return regex.test(normalizedPath)
  } catch {
    // Invalid regex pattern
    return false
  }
}
