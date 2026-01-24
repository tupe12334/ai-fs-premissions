import type { Operation } from './types.js'

/**
 * Parsed CLI arguments
 */
export interface CliArgs {
  /** Operation to check (read/write) */
  operation: Operation | null
  /** File path to check */
  path: string | null
  /** Custom config file path */
  configPath: string | null
  /** Show help */
  showHelp: boolean
  /** Show version */
  showVersion: boolean
  /** Show merged config (debug) */
  showConfig: boolean
  /** Validate config file */
  validate: boolean
}

/**
 * Parses command line arguments
 */
export function parseArgs(
  args: string[],
  onError: (message: string) => never
): CliArgs {
  const result: CliArgs = {
    operation: null,
    path: null,
    configPath: null,
    showHelp: false,
    showVersion: false,
    showConfig: false,
    validate: false,
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      result.showHelp = true
      i++
      continue
    }

    if (arg === '--version' || arg === '-v') {
      result.showVersion = true
      i++
      continue
    }

    if (arg === '--show-config') {
      result.showConfig = true
      i++
      continue
    }

    if (arg === '--validate') {
      result.validate = true
      i++
      continue
    }

    if (arg === '--op') {
      const value = args[i + 1]
      if (!value || value.startsWith('-')) {
        onError('--op requires a value (read or write)')
      }
      if (value !== 'read' && value !== 'write') {
        onError(`Invalid operation: ${value}. Must be 'read' or 'write'`)
      }
      result.operation = value as Operation
      i += 2
      continue
    }

    if (arg === '--path') {
      const value = args[i + 1]
      if (!value || value.startsWith('-')) {
        onError('--path requires a value')
      }
      result.path = value
      i += 2
      continue
    }

    if (arg === '--config') {
      const value = args[i + 1]
      if (!value || value.startsWith('-')) {
        onError('--config requires a value')
      }
      result.configPath = value
      i += 2
      continue
    }

    // Unknown argument
    if (arg.startsWith('-')) {
      onError(`Unknown option: ${arg}`)
    }

    // Positional argument (treat as path if not set)
    if (result.path === null) {
      result.path = arg
    }
    i++
  }

  return result
}
