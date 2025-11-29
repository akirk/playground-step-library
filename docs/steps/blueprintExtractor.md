# `blueprintExtractor` Step

Generate a new blueprint after modifying the WordPress.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=blueprintExtractor)**

[View Source](../../steps/blueprintExtractor.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "blueprintExtractor"
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "git:directory",
        "url": "https://github.com/akirk/blueprint-extractor",
        "ref": "HEAD"
      },
      "options": {
        "activate": true
      },
      "progress": {
        "caption": "Installing plugin from GitHub: akirk/blueprint-extractor"
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
      "step": "installPlugin",
      "pluginData": {
        "resource": "git:directory",
        "url": "https://github.com/akirk/blueprint-extractor",
        "ref": "HEAD"
      },
      "options": {
        "activate": true
      },
      "progress": {
        "caption": "Installing plugin from GitHub: akirk/blueprint-extractor"
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
          "step": "blueprintExtractor"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

