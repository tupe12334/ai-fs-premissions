import { z } from 'zod'

/**
 * Schema for a single permission rule
 */
export const RuleSchema = z
  .object({
    path: z.string().min(1),
    paths: z.array(z.string().min(1)).optional(),
    type: z.enum(['glob', 'regex']).default('glob'),
    access: z.enum(['none', 'read', 'write', 'readwrite']),
    reason: z.string().optional(),
  })
  .refine(data => data.path || (data.paths && data.paths.length > 0), {
    message: 'Either path or paths must be provided',
  })

/**
 * Schema for the configuration file
 */
export const ConfigSchema = z.object({
  version: z.number().int().positive().default(1),
  extends: z.boolean().default(true),
  rules: z.array(RuleSchema).default([]),
})

/**
 * Raw rule type from YAML
 */
export type RawRule = z.infer<typeof RuleSchema>

/**
 * Raw config type from YAML
 */
export type RawConfig = z.infer<typeof ConfigSchema>
