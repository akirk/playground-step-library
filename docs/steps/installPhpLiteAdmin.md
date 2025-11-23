# `installPhpLiteAdmin` Step

Provide phpLiteAdmin. Password: admin

**[View Source](../../steps/installPhpLiteAdmin.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installPhpLiteAdmin"
    }
```

## Compiled Output

### Blueprint V1

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

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/phpliteadmin.php",
      "data": "<?php\nadd_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {\n        $wp_menu->add_node(\n                array(\n                        'id'     => 'phpliteadmin',\n                        'title'  => 'phpliteadmin',\n                        'href'   => '/phpliteadmin.php',\n                )\n        );\n}, 100 );"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/phpliteadmin.config.php",
      "data": "<?php\n\n$databases = array(\n\tarray(\n\t\t'path'=> '/wordpress/wp-content/database/.ht.sqlite',\n\t\t'name'=> 'WordPress'\n\t),\n);\n$directory = false;\n"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/phpliteadmin.php",
      "data": {
        "resource": "url",
        "url": "https://gist.githubusercontent.com/akirk/c88d7e5f4a0e93c07b437b43fc62ac0c/raw/879692a465c5393cfceaa03dcdf16fef4edea108/phpliteadmin.php"
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

