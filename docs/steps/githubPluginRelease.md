# `githubPluginRelease` Step

Install a specific plugin release from a Github repository.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=githubPluginRelease)**

[View Source](../../steps/githubPluginRelease.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `repo` | string | ✅ Yes | The plugin resides in this GitHub repository. |
| `release` | string | ✅ Yes | The release tag. |
| `filename` | string | ✅ Yes | Which filename to use. |


## Examples

### Basic Usage
```json
    {
          "step": "githubPluginRelease",
          "vars": {
                "repo": "ryanwelcher/interactivity-api-todomvc",
                "release": "v0.1.3",
                "filename": "to-do-mvc.zip"
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
        "resource": "url",
        "url": "https://github.com/ryanwelcher/interactivity-api-todomvc/releases/download/..."
      },
      "options": {
        "activate": true
      },
      "progress": {
        "caption": "Installing to-do-mvc.zip from ryanwelcher/interactivity-api-todomvc (v0.1.3..."
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "plugins": [
    "https://github.com/ryanwelcher/interactivity-api-todomvc/releases/download/v0.1.3/to-do-mvc.zip"
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
          "step": "githubPluginRelease",
          "vars": {
                "repo": "ryanwelcher/interactivity-api-todomvc",
                "release": "v0.1.3",
                "filename": "to-do-mvc.zip"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

