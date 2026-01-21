# `resetData` Step

Deletes WordPress posts and comments and sets the auto increment sequence.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=resetData)**

[View Source](../../steps/resetData.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`resetData`](../builtin-step-usage.md#resetdata)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "resetData"
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "resetData"
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
      "step": "resetData"
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
          "step": "resetData"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

