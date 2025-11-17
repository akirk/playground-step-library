# `addCorsProxy` Step

Automatically add the CORS proxy to outgoing HTTP requests.

**[View Source](../../steps/addCorsProxy.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "addCorsProxy"
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
      "path": "/wordpress/wp-content/mu-plugins/addCorsProxy.php",
      "data": "<?php add_action( 'requests-requests.before_request', function( &$url ) {\n$..."
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
          "step": "addCorsProxy"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

