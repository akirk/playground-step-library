# `disableWelcomeGuides` Step

Disable the welcome guides in the site editor.

**[View Source](../../steps/disableWelcomeGuides.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "disableWelcomeGuides"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/disable-welcome-guides.php",
      "data": "<?php\nfunction my_disable_welcome_guides() {\nwp_add_inline_script( 'wp-data..."
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
          "step": "disableWelcomeGuides"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

