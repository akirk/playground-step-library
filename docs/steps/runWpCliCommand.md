# `runWpCliCommand` Step

Run a wp-cli command.

**[View Source](../../steps/runWpCliCommand.ts)**

## Type
⚡ **Custom Step**

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

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "runWpCliCommand",
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

