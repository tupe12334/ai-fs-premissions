# Add JSON Schema for YAML configuration file

Provide type safety and IDE support for `.ai-fs-permissions.yaml` configuration files.

## Problem

Users editing `.ai-fs-permissions.yaml` files have no IDE support:
- No autocomplete for valid keys (`version`, `extends`, `rules`, `path`, `access`, etc.)
- No inline validation - errors only appear at runtime
- No tooltips explaining fields or valid values

## Solution

### 1. Create JSON Schema file

Create `schema/ai-fs-permissions.schema.json` defining:
- `version` (integer, default: 1)
- `extends` (boolean, default: true)
- `rules` array with:
  - `path` or `paths`
  - `type` (enum: glob, regex)
  - `access` (enum: none, read, write, readwrite)
  - `reason` (optional string)

### 2. Publish to SchemaStore

Submit schema to [SchemaStore](https://www.schemastore.org/) so IDEs auto-recognize `.ai-fs-permissions.yaml` files.

### 3. Document usage

Show users how to manually reference the schema:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/tupe12334/ai-fs-permissions/main/schema/ai-fs-permissions.schema.json

version: 1
rules:
  - path: ".env"
    access: none
```

## Tasks

- [ ] Create `schema/ai-fs-permissions.schema.json`
- [ ] Add tests to ensure schema stays in sync with Zod schema
- [ ] Submit PR to SchemaStore
- [ ] Update README with schema usage
