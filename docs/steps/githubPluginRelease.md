# `githubPluginRelease` Step

Install a specific plugin release from a Github repository.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | ❌ No | The plugin resides in this GitHub repository. |
| `release` | string | ❌ No | The release tag. |
| `filename` | string | ❌ No | Which filename to use. |


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

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "githubPluginRelease",
          "repo": "ryanwelcher/interactivity-api-todomvc",
          "release": "v0.1.3",
          "filename": "to-do-mvc.zip"
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
          "step": "githubPluginRelease",
          "repo": "ryanwelcher/interactivity-api-todomvc",
          "release": "v0.1.3",
          "filename": "to-do-mvc.zip"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

