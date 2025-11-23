# `installTheme` Step

Install a theme via WordPress.org or Github.

**[View Source](../../steps/installTheme.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`installTheme`](../builtin-step-usage.md#installtheme)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the theme or WordPress.org slug |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "installTheme",
          "vars": {
                "url": "pendant"
          }
    }
```

### Advanced Usage
```json
{
          "step": "installTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso",
                "prs": true
          }
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "installTheme",
      "url": "pendant",
      "prs": "false"
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "installTheme",
          "vars": {
                "url": "pendant",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

