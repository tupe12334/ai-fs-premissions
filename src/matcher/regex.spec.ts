import { describe, it, expect } from 'vitest'
import { matchRegex } from './regex.js'

describe('matchRegex', () => {
  it('matches simple regex', () => {
    expect(matchRegex('^.*\\.key$', 'secret.key')).toBe(true)
    expect(matchRegex('^.*\\.key$', 'secret.txt')).toBe(false)
  })

  it('matches complex patterns', () => {
    expect(matchRegex('^src/.*\\.ts$', 'src/index.ts')).toBe(true)
    expect(matchRegex('^src/.*\\.ts$', 'lib/index.ts')).toBe(false)
  })

  it('handles invalid regex gracefully', () => {
    expect(matchRegex('[invalid', 'test')).toBe(false)
  })

  it('normalizes path separators', () => {
    expect(matchRegex('^src/.*\\.ts$', 'src\\index.ts')).toBe(true)
  })
})
