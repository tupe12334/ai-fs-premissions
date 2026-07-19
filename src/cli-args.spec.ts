import { describe, it, expect, vi } from 'vitest'
import { parseArgs } from './cli-args.js'

/** Builds an onError that throws so tests can assert on the message. */
function makeOnError() {
  const onError = vi.fn((message: string): never => {
    throw new Error(message)
  })
  return onError
}

describe('parseArgs', () => {
  it('returns defaults when no args are given', () => {
    const result = parseArgs([], makeOnError())
    expect(result).toEqual({
      operation: null,
      path: null,
      configPath: null,
      showHelp: false,
      showVersion: false,
      showConfig: false,
      validate: false,
    })
  })

  it('parses --op read', () => {
    const result = parseArgs(['--op', 'read'], makeOnError())
    expect(result.operation).toBe('read')
  })

  it('parses --op write', () => {
    const result = parseArgs(['--op', 'write'], makeOnError())
    expect(result.operation).toBe('write')
  })

  it('rejects an invalid --op value', () => {
    const onError = makeOnError()
    expect(() => parseArgs(['--op', 'delete'], onError)).toThrow()
    expect(onError).toHaveBeenCalledWith(
      "Invalid operation: delete. Must be 'read' or 'write'"
    )
  })

  it('errors when --op is missing its value', () => {
    const onError = makeOnError()
    expect(() => parseArgs(['--op'], onError)).toThrow()
    expect(onError).toHaveBeenCalled()
  })

  it('parses --path', () => {
    const result = parseArgs(['--path', 'src/index.ts'], makeOnError())
    expect(result.path).toBe('src/index.ts')
  })

  it('falls back to a positional argument for path', () => {
    const result = parseArgs(['src/index.ts'], makeOnError())
    expect(result.path).toBe('src/index.ts')
  })

  it('prefers --path over a positional argument', () => {
    const result = parseArgs(
      ['positional.ts', '--path', 'flagged.ts'],
      makeOnError()
    )
    expect(result.path).toBe('flagged.ts')
  })

  it('parses --config', () => {
    const result = parseArgs(['--config', 'custom.yaml'], makeOnError())
    expect(result.configPath).toBe('custom.yaml')
  })

  it('parses --help and -h', () => {
    expect(parseArgs(['--help'], makeOnError()).showHelp).toBe(true)
    expect(parseArgs(['-h'], makeOnError()).showHelp).toBe(true)
  })

  it('parses --version and -v', () => {
    expect(parseArgs(['--version'], makeOnError()).showVersion).toBe(true)
    expect(parseArgs(['-v'], makeOnError()).showVersion).toBe(true)
  })

  it('parses --show-config', () => {
    expect(parseArgs(['--show-config'], makeOnError()).showConfig).toBe(true)
  })

  it('parses --validate', () => {
    expect(parseArgs(['--validate'], makeOnError()).validate).toBe(true)
  })

  it('routes unknown options through onError', () => {
    const onError = makeOnError()
    expect(() => parseArgs(['--bogus'], onError)).toThrow()
    expect(onError).toHaveBeenCalled()
  })

  it('parses a combination of flags together', () => {
    const result = parseArgs(
      ['--op', 'write', '--path', 'a.ts', '--config', 'c.yaml'],
      makeOnError()
    )
    expect(result).toEqual({
      operation: 'write',
      path: 'a.ts',
      configPath: 'c.yaml',
      showHelp: false,
      showVersion: false,
      showConfig: false,
      validate: false,
    })
  })
})
