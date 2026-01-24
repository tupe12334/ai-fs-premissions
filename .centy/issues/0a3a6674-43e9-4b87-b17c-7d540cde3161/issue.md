# Replace ESLint config with eslint-config-agent

Replace the current ESLint configuration with eslint-config-agent as the sole ESLint config for the project.

## Current State

The project currently uses a custom ESLint configuration in eslint.config.mjs with:

* @eslint/js recommended config
* typescript-eslint recommended config

## Proposed Changes

1. Install eslint-config-agent as a dev dependency
1. Remove existing ESLint config packages (@eslint/js, typescript-eslint)
1. Update eslint.config.mjs to use only eslint-config-agent
1. Ensure all lint rules pass with the new configuration

## Acceptance Criteria

* eslint-config-agent is the only ESLint configuration used
* All existing code passes linting with the new config
* No other ESLint config packages are installed (except for peer dependencies if required)
