# `importThemeStarterContent` Step

The step identifier.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=importThemeStarterContent)**

[View Source](../../steps/importThemeStarterContent.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`importThemeStarterContent`](../builtin-step-usage.md#importthemestartercontent)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `themeSlug` | string | ❌ No | The name of the theme to import content from. |


## Examples

### Basic Usage
```json
    {
          "step": "importThemeStarterContent"
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "importThemeStarterContent"
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
      "step": "importThemeStarterContent"
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
          "step": "importThemeStarterContent",
          "vars": {
                "themeSlug": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

