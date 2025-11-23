# `githubPluginRelease` Step

Install a specific plugin release from a Github repository.

**[View Source](../../steps/githubPluginRelease.ts)**

## Type
⚡ **Custom Step**


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

