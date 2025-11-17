# `installTheme` Step

Install a theme via WordPress.org or Github.

**[View Source](../../steps/installTheme.ts)**

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the theme or WordPress.org slug |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "installTheme",
          "url": "pendant",
          "prs": "false"
    }
```

## Usage in Blueprint

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

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "installTheme",
          "url": "pendant",
          "prs": "false"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

