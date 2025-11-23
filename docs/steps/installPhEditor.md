# `installPhEditor` Step

Install phEditor. Password: admin

**[View Source](../../steps/installPhEditor.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile), [`unzip`](../builtin-step-usage.md#unzip)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installPhEditor"
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "landingPage": "/pheditor-main/pheditor.php",
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/phEditor.php",
      "data": "<?php\nadd_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {\n$wp..."
    },
    {
      "step": "unzip",
      "zipFile": {
        "resource": "git:directory",
        "url": "https://github.com/akirk/pheditor",
        "ref": "HEAD"
      },
      "extractToPath": "/wordpress/"
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
      "path": "/wordpress/wp-content/mu-plugins/phEditor.php",
      "data": "<?php\nadd_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {\n        $wp_menu->add_node(\n                array(\n                        'id'     => 'pheditor',\n                        'title'  => 'phEditor',\n                        'href'   => '/pheditor-main/pheditor.php',\n                )\n        );\n}, 100 );"
    },
    {
      "step": "unzip",
      "zipFile": {
        "resource": "git:directory",
        "url": "https://github.com/akirk/pheditor",
        "ref": "HEAD"
      },
      "extractToPath": "/wordpress/"
    }
  ],
  "applicationOptions": {
    "wordpress-playground": {
      "landingPage": "/pheditor-main/pheditor.php"
    }
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
          "step": "installPhEditor"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

