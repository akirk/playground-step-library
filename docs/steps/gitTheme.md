# `gitTheme` Step

Install a theme from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=gitTheme)**

[View Source](../../steps/gitTheme.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installTheme`](../builtin-step-usage.md#installtheme)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Git URL of the theme (supports GitHub, GitLab, Bitbucket, Codeberg, and other git hosts). |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |


## Examples

### Basic Usage
```json
    {
          "step": "gitTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso"
          }
    }
```

### Advanced Usage
```json
{
          "step": "gitTheme",
          "vars": {
                "url": "https://codeberg.org/cyclotouriste/jednotka",
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
          "step": "gitTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso",
                "prs": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

