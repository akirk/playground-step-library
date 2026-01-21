# `runSql` Step

The step identifier.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=runSql)**

[View Source](../../steps/runSql.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`runSql`](../builtin-step-usage.md#runsql)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `sql` | string | ✅ Yes | The SQL to run. Each non-empty line must contain a valid SQL query. |


## Examples

### Basic Usage
```json
    {
          "step": "runSql",
          "vars": {
                "sql": "example-value"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "runSql"
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
      "step": "runSql"
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
          "step": "runSql",
          "vars": {
                "sql": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

