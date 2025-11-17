# `addClientRole` Step

Adds a role for clients with additional capabilities than editors, but not quite admin.

**[View Source](../../steps/addClientRole.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `displayName` | string | ✅ Yes | Display name for the client role |


## Examples

### Basic Usage
```json
    {
          "step": "addClientRole",
          "displayName": "Client"
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
      "path": "/wordpress/wp-content/mu-plugins/add-client-role.php",
      "data": "<?php\nadd_action(\n'init',\nstatic function () {\n// The client role inherits ..."
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
          "step": "addClientRole",
          "displayName": "Client"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

