#!/usr/bin/env node
/**
 * ai-fs-permissions CLI
 *
 * A platform-agnostic tool to enforce file system permissions for AI agents.
 * Works with Claude Code, Gemini CLI, Cursor, and other AI coding tools.
 */

import { parseArgs } from './cli-args.js'
import { HELP_TEXT } from './cli-help.js'
import { loadConfig } from './config/loader.js'
import { checkPermission } from './checker.js'
import { outputResult } from './output.js'
import { parseStdin, readStdin } from './stdin.js'
import { EXIT_CODES } from './exit-codes.js'
import type { Operation } from './types.js'

const VERSION = '0.1.1'

function handleError(message: string): never {
  console.error(`Error: ${message}`)
  console.error('Use --help for usage information')
  process.exit(EXIT_CODES.ERROR)
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2), handleError)

    if (args.showHelp) {
      console.log(HELP_TEXT)
      process.exit(EXIT_CODES.ALLOWED)
    }

    if (args.showVersion) {
      console.log(VERSION)
      process.exit(EXIT_CODES.ALLOWED)
    }

    const cwd = process.cwd()
    const config = loadConfig(cwd, args.configPath ?? undefined)

    if (args.showConfig) {
      console.log(JSON.stringify(config, null, 2))
      process.exit(EXIT_CODES.ALLOWED)
    }

    if (args.validate) {
      if (config.rules.length === 0) {
        console.log('No config file found or config has no rules')
      } else {
        console.log(`Config valid: ${config.rules.length} rule(s) loaded`)
      }
      process.exit(EXIT_CODES.ALLOWED)
    }

    // Get path and operation from args or stdin
    let filePath = args.path
    let operation: Operation | null = args.operation

    // If no path from args, try stdin
    if (filePath === null) {
      const stdinInput = await readStdin()
      if (stdinInput.trim()) {
        const parsed = parseStdin(stdinInput)
        filePath = parsed.path

        // Infer operation from tool if not provided
        if (operation === null && parsed.inferredOperation) {
          operation = parsed.inferredOperation
        }
      }
    }

    // Validate required arguments
    if (filePath === null || filePath.trim() === '') {
      // No path provided and no stdin - this is OK, just allow
      // This handles cases where hooks are called but no file is involved
      process.exit(EXIT_CODES.ALLOWED)
    }

    if (operation === null) {
      handleError('Operation required. Use --op read or --op write')
    }

    // Check permission
    const result = checkPermission(config, filePath, operation)
    outputResult(result)

    process.exit(result.allowed ? EXIT_CODES.ALLOWED : EXIT_CODES.BLOCKED)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error:', message)
    process.exit(EXIT_CODES.ERROR)
  }
}

main()
