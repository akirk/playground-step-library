# `runPHP` Step

Run code in the context of WordPress.

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | textarea | ✅ Yes | The code to run |


## Examples

### Basic Usage
```json
    {
          "step": "runPHP",
          "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "runPHP",
          "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
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
          "step": "runPHP",
          "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

