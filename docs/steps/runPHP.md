# `runPHP` Step

Run code in the context of WordPress.

**[View Source](../../steps/runPHP.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `code` | textarea | ✅ Yes | The code to run |


## Examples

### Basic Usage
```json
    {
          "step": "runPHP",
          "vars": {
                "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that ..."
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
      "step": "runPHP"
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
          "step": "runPHP",
          "vars": {
                "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

