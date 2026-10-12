# `wpapp` Step

Install a GitHub app with the akirk/wp-app package and preview autoloader.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=wpapp)**

[View Source](../../steps/wpapp.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | GitHub URL of the app (repository, branch, or pull request). |
| `pluginSlug` | string | ❌ No | Plugin folder name (defaults to the repository or directory name). |
| `pluginFile` | string | ❌ No | Plugin entry PHP filename (defaults to the plugin slug plus .php). |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "wpapp",
          "vars": {
                "url": "https://example.com"
          }
    }
```

### Advanced Usage
```json
{
          "step": "wpapp",
          "vars": {
                "url": "https://example.com",
                "pluginSlug": "example-value",
                "pluginFile": "example-value",
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
          "step": "wpapp",
          "vars": {
                "url": "https://example.com",
                "pluginSlug": "example-value",
                "pluginFile": "example-value",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

