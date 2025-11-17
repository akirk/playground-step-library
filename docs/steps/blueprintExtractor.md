# `blueprintExtractor` Step

Generate a new blueprint after modifying the WordPress.

**[View Source](../../steps/blueprintExtractor.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `installPlugin`

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "blueprintExtractor"
    }
```

## Compiled Output

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

