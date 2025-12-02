# `githubTheme` Step

Install a theme from a Github repository.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=githubTheme)**

[View Source](../../steps/githubTheme.ts) to understand how this step is implemented.

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

