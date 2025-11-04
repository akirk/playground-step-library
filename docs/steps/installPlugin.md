# `installPlugin` Step

Install a plugin via WordPress.org or Github (branches, releases, PRs).

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |
| `permalink` | boolean | ❌ No | Requires a permalink structure |


## Examples

### Basic Usage
```json
    {
          "step": "installPlugin",
          "url": "hello-dolly",
          "prs": "false",
          "permalink": false
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "installPlugin",
          "url": "hello-dolly",
          "prs": "false",
          "permalink": false
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
          "step": "installPlugin",
          "url": "hello-dolly",
          "prs": "false",
          "permalink": false
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
