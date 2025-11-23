# `githubTheme` Step

Install a theme from a Github repository.

**[View Source](../../steps/githubTheme.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`installTheme`](../builtin-step-usage.md#installtheme)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Github URL of the theme. |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


## Examples

### Basic Usage
```json
    {
          "step": "githubTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso"
          }
    }
```

### Advanced Usage
```json
{
          "step": "githubTheme",
          "vars": {
                "url": "ndiego/nautilus",
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
        "resource": "git:directory",
        "url": "https://github.com/richtabor/kanso",
        "ref": "HEAD"
      },
      "options": {
        "activate": true
      },
      "progress": {
        "caption": "Installing theme from GitHub: richtabor/kanso"
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
      "step": "installTheme",
      "themeData": {
        "resource": "git:directory",
        "url": "https://github.com/richtabor/kanso",
        "ref": "HEAD"
      },
      "options": {
        "activate": true
      },
      "progress": {
        "caption": "Installing theme from GitHub: richtabor/kanso"
      },
      "queryParams": {
        "gh-ensure-auth": "yes",
        "ghexport-repo-url": "https://github.com/richtabor/kanso",
        "ghexport-content-type": "theme",
        "ghexport-theme": "kanso",
        "ghexport-playground-root": "/wordpress/wp-content/themes/kanso",
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
          "step": "githubTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

