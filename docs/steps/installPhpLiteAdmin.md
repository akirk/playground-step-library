# `installPhpLiteAdmin` Step

Provide phpLiteAdmin. Password: admin

**[View Source](../../steps/installPhpLiteAdmin.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installPhpLiteAdmin"
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
      "path": "/wordpress/wp-content/mu-plugins/phpliteadmin.php",
      "data": "<?php\nadd_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {\n$wp..."
    },
    {
      "step": "writeFile",
      "path": "/wordpress/phpliteadmin.config.php",
      "data": "<?php\n$databases = array(\narray(\n'path'=> '/wordpress/wp-content/database/...."
    },
    {
      "step": "writeFile",
      "path": "/wordpress/phpliteadmin.php",
      "data": {
        "resource": "url",
        "url": "https://gist.githubusercontent.com/akirk/c88d7e5f4a0e93c07b437b43fc62ac0c/r..."
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
          "step": "installPhpLiteAdmin"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

