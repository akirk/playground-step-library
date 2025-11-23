# `installPlugin` Step

Install a plugin via WordPress.org or Github (branches, releases, PRs).

**[View Source](../../steps/installPlugin.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


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
      "url": "hello-dolly",
      "prs": "false"
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "plugins": [
    ""
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
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

