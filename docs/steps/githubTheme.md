# `githubTheme` Step

Install a theme from a Github repository.

**[View Source](../../steps/githubTheme.ts)**

## Type
⚡ **Custom Step**


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

