# `githubPluginRelease` Step

Install a specific plugin release from a Github repository.

**[View Source](../../steps/githubPluginRelease.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | ✅ Yes | The plugin resides in this GitHub repository. |
| `release` | string | ✅ Yes | The release tag. |
| `filename` | string | ✅ Yes | Which filename to use. |


## Examples

### Basic Usage
```json
    {
          "step": "githubPluginRelease",
          "repo": "ryanwelcher/interactivity-api-todomvc",
          "release": "v0.1.3",
          "filename": "to-do-mvc.zip"
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

### V2 (Declarative)

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
          "repo": "ryanwelcher/interactivity-api-todomvc",
          "release": "v0.1.3",
          "filename": "to-do-mvc.zip"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

