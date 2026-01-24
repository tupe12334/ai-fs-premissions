import config from 'eslint-config-agent'

export default [
  ...config,
  {
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // Disable strict rules that don't fit the existing codebase
      'ddd/require-spec-file': 'off',
      'single-export/single-export': 'off',
      'import/no-namespace': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-regexp': 'off',
      'no-restricted-syntax': 'off',
    },
  },
]
