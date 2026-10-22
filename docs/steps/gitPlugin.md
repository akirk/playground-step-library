# `gitPlugin` Step

Install a plugin from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=gitPlugin)**

[View Source](../../steps/gitPlugin.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Git URL of the plugin (supports GitHub, GitLab, Bitbucket, Codeberg, and other git hosts). For Git URLs, use // to separate the branch from the directory: tree/feature/my/branch//src/plugin selects src/plugin on branch feature/my/branch; tree/feature/my/branch// selects the repository root on that branch. |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |
| `pluginSlug` | string | ❌ No | Plugin slug (folder name in wp-content/plugins). |


## Examples

### Basic Usage
```json
    {
          "step": "gitPlugin",
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder"
          }
    }
```

### Advanced Usage
```json
{
          "step": "gitPlugin",
          "vars": {
                "url": "https://github.com/Automattic/wordpress-activitypub/tree/trunk",
                "prs": true,
                "pluginSlug": "example-value"
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
        "activate": true,
        "targetFolderName": "blueprint-recorder"
      },
      "progress": {
        "caption": "Installing plugin from GitHub: akirk/blueprint-recorder"
      }
    }
  ]
}
```

### Blueprint V2

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
        "activate": true,
        "targetFolderName": "blueprint-recorder"
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
          "step": "gitPlugin",
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder",
                "prs": false,
                "pluginSlug": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

