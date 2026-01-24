import { TOOL_OPERATIONS, type Operation } from './types.js'

/**
 * Result of parsing stdin input
 */
export interface StdinParseResult {
  /** The file path extracted from input */
  path: string | null
  /** The tool name if detected */
  tool?: string
  /** The inferred operation based on tool */
  inferredOperation?: Operation
}

/**
 * Type-safe property check
 */
function hasProperty(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * Type-safe property access
 */
function getProperty(obj: object, key: string): unknown {
  const entries = Object.entries(obj)
  for (const entry of entries) {
    if (entry[0] === key) {
      return entry[1]
    }
  }
  return undefined
}

/**
 * Extracts file path from various JSON structures
 */
function extractPathFromJson(parsed: object): string | null {
  // Claude Code format: { tool_input: { file_path: "..." } }
  if (hasProperty(parsed, 'tool_input')) {
    const toolInput = getProperty(parsed, 'tool_input')
    if (typeof toolInput === 'object' && toolInput !== null) {
      // Check for file_path (Read, Write, Edit tools)
      if (hasProperty(toolInput, 'file_path')) {
        const filePath = getProperty(toolInput, 'file_path')
        if (typeof filePath === 'string') {
          return filePath
        }
      }
      // Check for path (Glob tool)
      if (hasProperty(toolInput, 'path')) {
        const path = getProperty(toolInput, 'path')
        if (typeof path === 'string') {
          return path
        }
      }
      // Check for notebook_path (NotebookEdit tool)
      if (hasProperty(toolInput, 'notebook_path')) {
        const notebookPath = getProperty(toolInput, 'notebook_path')
        if (typeof notebookPath === 'string') {
          return notebookPath
        }
      }
    }
  }

  // Generic JSON formats
  const pathKeys = ['file_path', 'path', 'filePath', 'file', 'notebook_path']
  for (const key of pathKeys) {
    if (hasProperty(parsed, key)) {
      const value = getProperty(parsed, key)
      if (typeof value === 'string') {
        return value
      }
    }
  }

  return null
}

/**
 * Extracts tool name from JSON input
 */
function extractToolFromJson(parsed: object): string | null {
  // Check for tool_name field
  if (hasProperty(parsed, 'tool_name')) {
    const toolName = getProperty(parsed, 'tool_name')
    if (typeof toolName === 'string') {
      return toolName
    }
  }

  // Check for tool field
  if (hasProperty(parsed, 'tool')) {
    const tool = getProperty(parsed, 'tool')
    if (typeof tool === 'string') {
      return tool
    }
  }

  return null
}

/**
 * Parses stdin input and extracts file path
 */
export function parseStdin(input: string): StdinParseResult {
  const trimmed = input.trim()

  // Try JSON parsing first
  if (trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (typeof parsed === 'object' && parsed !== null) {
        const path = extractPathFromJson(parsed)
        const tool = extractToolFromJson(parsed)
        const inferredOperation = tool ? TOOL_OPERATIONS[tool] : undefined

        return { path, tool: tool ?? undefined, inferredOperation }
      }
    } catch {
      // Not valid JSON, fall through to plain text
    }
  }

  // Plain text - treat as file path
  return { path: trimmed || null }
}

/**
 * Reads stdin asynchronously
 */
export async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''

    process.stdin.setEncoding('utf8')

    process.stdin.on('data', chunk => {
      data += chunk
    })

    process.stdin.on('end', () => {
      resolve(data)
    })

    process.stdin.on('error', err => {
      reject(err)
    })

    if (process.stdin.isTTY) {
      resolve('')
    }
  })
}
