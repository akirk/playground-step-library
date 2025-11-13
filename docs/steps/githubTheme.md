# `githubTheme` Step

Install a theme from a Github repository.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ No | Github URL of the theme. |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "githubTheme",
          "url": "https://github.com/richtabor/kanso",
          "prs": "false"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "githubTheme",
          "url": "https://github.com/richtabor/kanso",
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
          "step": "githubTheme",
          "url": "https://github.com/richtabor/kanso",
          "prs": "false"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

