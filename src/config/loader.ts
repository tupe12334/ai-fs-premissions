import * as fs from 'node:fs'
import * as path from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { Config, Rule, PatternType } from '../types.js'
import { ConfigSchema, type RawRule } from './schema.js'

/**
 * Default config file names to search for
 */
const CONFIG_FILE_NAMES = ['.ai-fs-permissions.yaml', '.ai-fs-permissions.yml']

/**
 * User config directory
 */
const USER_CONFIG_DIR = path.join(
  process.env.HOME ?? process.env.USERPROFILE ?? '',
  '.config',
  'ai-fs-permissions'
)

/**
 * Converts a raw rule from YAML to internal Rule format
 */
function normalizeRule(raw: RawRule): Rule[] {
  const rules: Rule[] = []
  const paths = raw.paths ?? [raw.path]

  for (const p of paths) {
    const negated = p.startsWith('!')
    const cleanPath = negated ? p.slice(1) : p

    rules.push({
      path: cleanPath,
      type: (raw.type ?? 'glob') as PatternType,
      access: raw.access,
      reason: raw.reason,
      negated,
    })
  }

  return rules
}

/**
 * Loads a config file from a path
 */
export function loadConfigFile(filePath: string): Config | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = parseYaml(content)
    const validated = ConfigSchema.parse(parsed)

    const rules: Rule[] = []
    for (const rawRule of validated.rules) {
      rules.push(...normalizeRule(rawRule))
    }

    return {
      version: validated.version,
      extends: validated.extends,
      rules,
    }
  } catch {
    return null
  }
}

/**
 * Finds config file by walking up the directory tree (gitignore-style)
 */
export function findConfigFile(startDir: string): string | null {
  let currentDir = path.resolve(startDir)
  const root = path.parse(currentDir).root

  while (currentDir !== root) {
    for (const fileName of CONFIG_FILE_NAMES) {
      const filePath = path.join(currentDir, fileName)
      if (fs.existsSync(filePath)) {
        return filePath
      }
    }
    currentDir = path.dirname(currentDir)
  }

  return null
}

/**
 * Gets the user config file path
 */
export function getUserConfigPath(): string | null {
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.join(USER_CONFIG_DIR, fileName.replace(/^\./, ''))
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  // Also check for config.yaml
  const configPath = path.join(USER_CONFIG_DIR, 'config.yaml')
  if (fs.existsSync(configPath)) {
    return configPath
  }

  return null
}

/**
 * Merges multiple configs (later configs override earlier ones)
 */
export function mergeConfigs(...configs: (Config | null)[]): Config {
  const merged: Config = {
    version: 1,
    extends: true,
    rules: [],
  }

  for (const config of configs) {
    if (config === null) continue

    merged.version = config.version
    merged.extends = config.extends
    merged.rules = [...merged.rules, ...config.rules]
  }

  return merged
}

/**
 * Loads and merges all applicable configs
 */
export function loadConfig(cwd: string, explicitPath?: string): Config {
  // If explicit path provided, only use that
  if (explicitPath) {
    const config = loadConfigFile(explicitPath)
    return config ?? { version: 1, extends: true, rules: [] }
  }

  // Load user config
  const userConfigPath = getUserConfigPath()
  const userConfig = userConfigPath ? loadConfigFile(userConfigPath) : null

  // Find and load project config
  const projectConfigPath = findConfigFile(cwd)
  const projectConfig = projectConfigPath
    ? loadConfigFile(projectConfigPath)
    : null

  // Check if project config wants to extend user config
  if (projectConfig && !projectConfig.extends) {
    return projectConfig
  }

  // Merge configs (user first, project overrides)
  return mergeConfigs(userConfig, projectConfig)
}
