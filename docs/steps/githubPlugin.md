# `githubPlugin` Step

Install a plugin from a Github repository.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=githubPlugin)**

[View Source](../../steps/githubPlugin.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

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

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "git:directory",
        "url": "https://github.com/akirk/blueprint-recorder",
        "ref": "HEAD"
      },
      "options": {
        "activate": true
      },
      "progress": {
        "caption": "Installing plugin from GitHub: akirk/blueprint-recorder"
      }
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
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

