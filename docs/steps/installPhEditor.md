# `installPhEditor` Step

Install phEditor. Password: admin

**[View Source](../../steps/installPhEditor.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile), [`unzip`](../builtin-step-usage.md#unzip)

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installPhEditor"
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

