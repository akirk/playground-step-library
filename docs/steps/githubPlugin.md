# `githubPlugin` Step

Install a plugin from a Github repository.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ No | Github URL of the plugin. |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "githubPlugin",
          "url": "https://github.com/akirk/blueprint-recorder",
          "prs": "false"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "githubPlugin",
          "url": "https://github.com/akirk/blueprint-recorder",
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
          "step": "githubPlugin",
          "url": "https://github.com/akirk/blueprint-recorder",
          "prs": "false"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
