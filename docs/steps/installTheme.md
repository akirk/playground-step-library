# `installTheme` Step

Install a theme via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=installTheme)**

[View Source](../../steps/installTheme.ts) to understand how this step is implemented.

## Type
🔧 **Built-in Step**

**Compiles to:** [`installTheme`](../builtin-step-usage.md#installtheme)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the theme or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |


## Examples

### Basic Usage
```json
    {
          "step": "installTheme",
          "vars": {
                "url": "pendant"
          }
    }
```

### Advanced Usage
```json
{
          "step": "installTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso",
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
      "step": "installTheme",
      "themeData": {
        "resource": "wordpress.org/themes",
        "slug": "pendant"
      },
      "options": {
        "activate": true
      },
      "progress": {
        "caption": "Installing theme: pendant"
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "themes": [
    "pendant"
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
          "step": "installTheme",
          "vars": {
                "url": "pendant",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

