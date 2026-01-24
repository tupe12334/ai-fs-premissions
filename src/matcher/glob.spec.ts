import { describe, it, expect } from 'vitest'
import { matchGlob } from './glob.js'

describe('matchGlob', () => {
  describe('basic patterns', () => {
    it('matches exact path', () => {
      expect(matchGlob('.env', '.env')).toBe(true)
      expect(matchGlob('.env', '.env.local')).toBe(false)
    })

    it('matches single wildcard', () => {
      expect(matchGlob('*.ts', 'index.ts')).toBe(true)
      // To match only in current directory, be explicit about path structure
      expect(matchGlob('src/*.ts', 'src/index.ts')).toBe(true)
      expect(matchGlob('src/*.ts', 'lib/index.ts')).toBe(false)
    })
  })

  describe('globstar patterns', () => {
    it('matches ** at start', () => {
      expect(matchGlob('**/*.ts', 'index.ts')).toBe(true)
      expect(matchGlob('**/*.ts', 'src/index.ts')).toBe(true)
      expect(matchGlob('**/*.ts', 'src/deep/index.ts')).toBe(true)
    })

    it('matches ** in middle', () => {
      expect(matchGlob('src/**/*.ts', 'src/index.ts')).toBe(true)
      expect(matchGlob('src/**/*.ts', 'src/deep/index.ts')).toBe(true)
      expect(matchGlob('src/**/*.ts', 'lib/index.ts')).toBe(false)
    })

    it('matches ** at end', () => {
      expect(matchGlob('.centy/**', '.centy/settings.json')).toBe(true)
      expect(matchGlob('.centy/**', '.centy/issues/1/issue.md')).toBe(true)
      expect(matchGlob('.centy/**', '.claude/settings.json')).toBe(false)
    })
  })

  describe('dotfiles', () => {
    it('matches dotfiles', () => {
      expect(matchGlob('.env', '.env')).toBe(true)
      expect(matchGlob('**/.env*', '.env')).toBe(true)
      expect(matchGlob('**/.env*', '.env.local')).toBe(true)
      expect(matchGlob('**/.env*', 'config/.env')).toBe(true)
    })
  })

  describe('path separators', () => {
    it('normalizes backslashes', () => {
      expect(matchGlob('src/**/*.ts', 'src\\deep\\index.ts')).toBe(true)
    })
  })
})
