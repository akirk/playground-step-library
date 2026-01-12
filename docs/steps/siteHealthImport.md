# `siteHealthImport` Step

Import site configuration from WordPress Site Health info (Tools → Site Health → Info → Copy site info to clipboard).

**[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=siteHealthImport)**

[View Source](../../steps/siteHealthImport.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `siteHealth` | textarea | ✅ Yes | Paste the Site Health info text here. Go to Tools → Site Health → Info tab, then click "Copy site info to clipboard". |
| `installPlugins` | boolean | ❌ No | Install the plugins listed in the Site Health info. |
| `installTheme` | boolean | ❌ No | Install and activate the theme listed in the Site Health info. |


## Examples

### Basic Usage
```json
    {
          "step": "siteHealthImport",
          "vars": {
                "siteHealth": "example-value"
          }
    }
```

### Advanced Usage
```json
{
          "step": "siteHealthImport",
          "vars": {
                "siteHealth": "example-value",
                "installPlugins": false,
                "installTheme": false
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
          "step": "siteHealthImport",
          "vars": {
                "siteHealth": "example-value",
                "installPlugins": true,
                "installTheme": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```
