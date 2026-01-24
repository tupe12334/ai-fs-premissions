import { describe, it, expect } from 'vitest'
import { checkPermission } from './checker.js'
import type { Config } from './types.js'

describe('checkPermission', () => {
  const config: Config = {
    version: 1,
    extends: true,
    rules: [
      {
        path: '.centy/**',
        type: 'glob',
        access: 'read',
        reason: 'Config folder',
        negated: false,
      },
      {
        path: '**/.env*',
        type: 'glob',
        access: 'none',
        reason: 'Secrets',
        negated: false,
      },
      {
        path: '^.*\\.key$',
        type: 'regex',
        access: 'none',
        reason: 'Key files',
        negated: false,
      },
      {
        path: '.centy/user-config.yaml',
        type: 'glob',
        access: 'readwrite',
        reason: 'User editable',
        negated: true,
      },
    ],
  }

  describe('read access', () => {
    it('allows read on protected folder', () => {
      const result = checkPermission(config, '.centy/settings.json', 'read')
      expect(result.allowed).toBe(true)
      expect(result.rule).toBe('.centy/**')
    })

    it('blocks read on .env files', () => {
      const result = checkPermission(config, '.env', 'read')
      expect(result.allowed).toBe(false)
      expect(result.rule).toBe('**/.env*')
    })

    it('blocks read on key files (regex)', () => {
      const result = checkPermission(config, 'secret.key', 'read')
      expect(result.allowed).toBe(false)
      expect(result.rule).toBe('^.*\\.key$')
    })

    it('allows read on unmatched paths', () => {
      const result = checkPermission(config, 'src/index.ts', 'read')
      expect(result.allowed).toBe(true)
      expect(result.rule).toBeUndefined()
    })
  })

  describe('write access', () => {
    it('blocks write on read-only folder', () => {
      const result = checkPermission(config, '.centy/settings.json', 'write')
      expect(result.allowed).toBe(false)
      expect(result.rule).toBe('.centy/**')
      expect(result.message).toContain('PERMISSION DENIED')
    })

    it('blocks write on .env files', () => {
      const result = checkPermission(config, '.env.local', 'write')
      expect(result.allowed).toBe(false)
      expect(result.rule).toBe('**/.env*')
    })

    it('allows write on unmatched paths', () => {
      const result = checkPermission(config, 'src/index.ts', 'write')
      expect(result.allowed).toBe(true)
    })
  })

  describe('negation rules', () => {
    it('allows access on negated paths', () => {
      const result = checkPermission(
        config,
        '.centy/user-config.yaml',
        'write'
      )
      expect(result.allowed).toBe(true)
      expect(result.rule).toBe('!.centy/user-config.yaml')
    })
  })

  describe('path normalization', () => {
    it('removes leading ./', () => {
      const result = checkPermission(config, './.centy/test.json', 'write')
      expect(result.allowed).toBe(false)
      expect(result.path).toBe('.centy/test.json')
    })
  })

  describe('empty config', () => {
    it('allows all operations when no rules', () => {
      const emptyConfig: Config = { version: 1, extends: true, rules: [] }
      const result = checkPermission(emptyConfig, '.centy/test.json', 'write')
      expect(result.allowed).toBe(true)
    })
  })
})
