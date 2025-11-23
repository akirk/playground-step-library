# `githubPlugin` Step

Install a plugin from a Github repository.

**[View Source](../../steps/githubPlugin.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Github URL of the plugin. |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "githubPlugin",
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder"
          }
    }
```

### Advanced Usage
```json
{
          "step": "githubPlugin",
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder",
                "prs": true
          }
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
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

