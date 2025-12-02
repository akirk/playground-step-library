# `disableWelcomeGuides` Step

Disable the welcome guides in the site editor.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=disableWelcomeGuides)**

[View Source](../../steps/disableWelcomeGuides.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "disableWelcomeGuides"
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
      "path": "/wordpress/wp-content/mu-plugins/disable-welcome-guides-0.php",
      "data": "<?php \nfunction my_disable_welcome_guides() {\nwp_add_inline_script( 'wp-dat..."
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "muPlugins": [
    {
      "filename": "disable-welcome-guides-0.php",
      "content": "<?php \nfunction my_disable_welcome_guides() {\n\twp_add_inline_script( 'wp-data', \"window.onload = function() {\n\t\twindow.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuide', false );\n\t\twindow.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuideStyles', false );\n\t\twindow.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuidePage', false );\n\t\twindow.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuideTemplate', false );\n}\" );\n}\n\nadd_action( 'enqueue_block_editor_assets', 'my_disable_welcome_guides', 20 );\n"
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

