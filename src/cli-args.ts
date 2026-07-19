import arg from 'arg'
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

const spec = {
  '--op': String,
  '--path': String,
  '--config': String,
  '--show-config': Boolean,
  '--validate': Boolean,
  '--help': Boolean,
  '--version': Boolean,
  '-h': '--help',
  '-v': '--version',
} as const

/**
 * Parses command line arguments
 */
export function parseArgs(
  args: string[],
  onError: (message: string) => never
): CliArgs {
  let parsed: arg.Result<typeof spec>
  try {
    parsed = arg(spec, { argv: args })
  } catch (error) {
    if (error instanceof arg.ArgError) {
      onError(error.message)
    }
    throw error instanceof Error ? error : new Error(String(error))
  }

  const operation = parsed['--op']
  if (
    operation !== undefined &&
    operation !== 'read' &&
    operation !== 'write'
  ) {
    onError(`Invalid operation: ${operation}. Must be 'read' or 'write'`)
  }

  return {
    operation: (operation as Operation | undefined) ?? null,
    path: parsed['--path'] ?? parsed._[0] ?? null,
    configPath: parsed['--config'] ?? null,
    showHelp: parsed['--help'] ?? false,
    showVersion: parsed['--version'] ?? false,
    showConfig: parsed['--show-config'] ?? false,
    validate: parsed['--validate'] ?? false,
  }
}
