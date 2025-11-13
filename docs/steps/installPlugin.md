# `installPlugin` Step

Install a plugin via WordPress.org or Github (branches, releases, PRs).

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. |
| `auth` | boolean | ❌ No | Ask for GitHub authentication (needed for private repos). |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |
| `permalink` | boolean | ❌ No | Requires a permalink structure |


## Examples

### Basic Usage
```json
    {
          "step": "installPlugin",
          "url": "hello-dolly",
          "auth": "false",
          "prs": "false",
          "permalink": false
    }
```

### Advanced Usage
```json
{
  "step": "installPlugin",
  "url": "https://wordpress.org/plugins/friends",
  "auth": "true",
  "prs": "true",
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
          "auth": "false",
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
          "auth": "false",
          "prs": "false",
          "permalink": false
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

