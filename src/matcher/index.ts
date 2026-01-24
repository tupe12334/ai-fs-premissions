import type { PatternType } from '../types.js'
import { matchGlob } from './glob.js'
import { matchRegex } from './regex.js'

/**
 * Tests if a path matches a pattern of the specified type
 */
export function matchPath(
  pattern: string,
  type: PatternType,
  filePath: string
): boolean {
  if (type === 'regex') {
    return matchRegex(pattern, filePath)
  }
  return matchGlob(pattern, filePath)
}

export { matchGlob } from './glob.js'
export { matchRegex } from './regex.js'
