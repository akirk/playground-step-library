# `runWpCliCommand` Step

Run a wp-cli command.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=runWpCliCommand)**

[View Source](../../steps/runWpCliCommand.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`wp-cli`](../builtin-step-usage.md#wp-cli)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `command` | string | ✅ Yes | The wp-cli command to run |


## Examples

### Basic Usage
```json
    {
          "step": "runWpCliCommand",
          "vars": {
                "command": "example-value"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "wp-cli",
      "command": ""
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "wp-cli",
      "command": ""
    }
  ]
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "runWpCliCommand",
          "vars": {
                "command": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

