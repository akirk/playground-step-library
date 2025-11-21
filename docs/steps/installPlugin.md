# `installPlugin` Step

Install a plugin via WordPress.org or Github (branches, releases, PRs).

**[View Source](../../steps/installPlugin.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "installPlugin",
          "url": "hello-dolly",
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

### V2 (Declarative)

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
          "url": "hello-dolly",
          "prs": "false"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

