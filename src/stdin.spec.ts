import { describe, it, expect } from 'vitest'
import { parseStdin } from './stdin.js'

describe('parseStdin', () => {
  describe('Claude Code format', () => {
    it('extracts file_path from tool_input', () => {
      const input = JSON.stringify({
        tool_name: 'Write',
        tool_input: { file_path: '.centy/test.json' },
      })
      const result = parseStdin(input)
      expect(result.path).toBe('.centy/test.json')
      expect(result.tool).toBe('Write')
      expect(result.inferredOperation).toBe('write')
    })

    it('extracts path from Glob tool', () => {
      const input = JSON.stringify({
        tool_name: 'Glob',
        tool_input: { path: 'src', pattern: '**/*.ts' },
      })
      const result = parseStdin(input)
      expect(result.path).toBe('src')
      expect(result.inferredOperation).toBe('read')
    })

    it('extracts notebook_path from NotebookEdit', () => {
      const input = JSON.stringify({
        tool_name: 'NotebookEdit',
        tool_input: { notebook_path: 'analysis.ipynb' },
      })
      const result = parseStdin(input)
      expect(result.path).toBe('analysis.ipynb')
      expect(result.inferredOperation).toBe('write')
    })
  })

  describe('generic JSON format', () => {
    it('extracts file_path', () => {
      const input = JSON.stringify({ file_path: 'src/index.ts' })
      const result = parseStdin(input)
      expect(result.path).toBe('src/index.ts')
    })

    it('extracts path', () => {
      const input = JSON.stringify({ path: 'src/index.ts' })
      const result = parseStdin(input)
      expect(result.path).toBe('src/index.ts')
    })

    it('extracts filePath (camelCase)', () => {
      const input = JSON.stringify({ filePath: 'src/index.ts' })
      const result = parseStdin(input)
      expect(result.path).toBe('src/index.ts')
    })
  })

  describe('plain text format', () => {
    it('treats plain text as path', () => {
      const result = parseStdin('src/index.ts')
      expect(result.path).toBe('src/index.ts')
    })

    it('trims whitespace', () => {
      const result = parseStdin('  src/index.ts  \n')
      expect(result.path).toBe('src/index.ts')
    })

    it('returns null for empty input', () => {
      const result = parseStdin('')
      expect(result.path).toBe(null)
    })
  })

  describe('invalid JSON', () => {
    it('falls back to plain text', () => {
      const result = parseStdin('{invalid json')
      expect(result.path).toBe('{invalid json')
    })
  })
})
