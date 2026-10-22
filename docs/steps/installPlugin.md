# `installPlugin` Step

Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=installPlugin)**

[View Source](../../steps/installPlugin.ts) to understand how this step is implemented.

## Type
🔧 **Built-in Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. For Git URLs, use // to separate the branch from the directory: tree/feature/my/branch//src/plugin selects src/plugin on branch feature/my/branch; tree/feature/my/branch// selects the repository root on that branch. |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |
| `pluginSlug` | string | ❌ No | Plugin slug (folder name in wp-content/plugins). |


## Examples

### Basic Usage
```json
    {
          "step": "installPlugin",
          "vars": {
                "url": "hello-dolly"
          }
    }
```

### Advanced Usage
```json
{
          "step": "installPlugin",
          "vars": {
                "url": "https://wordpress.org/plugins/friends",
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
        "resource": "wordpress.org/plugins",
        "slug": "hello-dolly"
      },
      "options": {
        "activate": true
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
    "hello-dolly"
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
          "step": "installPlugin",
          "vars": {
                "url": "hello-dolly",
                "prs": false,
                "pluginSlug": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

