# `runSQL` Step

Execute SQL queries.

**[View Source](../../steps/runSQL.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runSql`](../builtin-step-usage.md#runsql)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sql` | textarea | ✅ Yes | SQL query or file reference to execute |


## Examples

### Basic Usage
```json
    {
          "step": "runSQL",
          "sql": "example-value"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "runSql",
      "sql": "example-value"
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
      "step": "runSql",
      "sql": "example-value"
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
          "step": "runSQL",
          "sql": "example-value"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

