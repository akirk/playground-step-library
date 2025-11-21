# `githubPlugin` Step

Install a plugin from a Github repository.

**[View Source](../../steps/githubPlugin.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ No | Github URL of the plugin. |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "githubPlugin",
          "url": "https://github.com/akirk/blueprint-recorder",
          "prs": "false"
    }
```

## Compiled Output

### V1 (Imperative)

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

### V2 (Declarative)

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
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
      },
      "queryParams": {
        "gh-ensure-auth": "yes",
        "ghexport-repo-url": "https://github.com/akirk/blueprint-recorder",
        "ghexport-content-type": "plugin",
        "ghexport-plugin": "blueprint-recorder",
        "ghexport-playground-root": "/wordpress/wp-content/plugins/blueprint-recorder",
        "ghexport-pr-action": "create",
        "ghexport-allow-include-zip": "no"
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
          "url": "https://github.com/akirk/blueprint-recorder",
          "prs": "false"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

