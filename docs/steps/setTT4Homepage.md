# `setTT4Homepage` Step

Set the homepage for the twentytwentyfour theme.

**[View Source](../../steps/setTT4Homepage.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "setTT4Homepage"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "runPHP",
      "progress": {
        "caption": "Setting up Twenty Twenty-Four homepage"
      },
      "code": "<?php require_once '/wordpress/wp-load.php';\n$term = get_term_by('slug', 't..."
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
          "step": "setTT4Homepage"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

