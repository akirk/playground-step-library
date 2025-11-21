# `runWpCliCommand` Step

Run a wp-cli command.

**[View Source](../../steps/runWpCliCommand.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`wp-cli`](../builtin-step-usage.md#wp-cli)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | ✅ Yes | The wp-cli command to run |


## Examples

### Basic Usage
```json
    {
          "step": "runWpCliCommand",
          "command": ""
    }
```

## Compiled Output

### V1 (Imperative)

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

### V2 (Declarative)

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
          "command": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

