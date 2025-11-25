# `gitPlugin` Step

Install a plugin from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).

**[View Source](../../steps/gitPlugin.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Git URL of the plugin (supports GitHub, GitLab, Bitbucket, Codeberg, and other git hosts). |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |


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
          "step": "gitPlugin",
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

