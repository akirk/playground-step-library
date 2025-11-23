# `installAdminer` Step

Install Adminer with auto login link.

**[View Source](../../steps/installAdminer.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installAdminer"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/adminer-link.php",
      "data": "<?php\nadd_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {\n$wp..."
    },
    {
      "step": "mkdir",
      "path": "/wordpress/adminer"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/adminer/index.php",
      "data": "<?php\nfunction adminer_object() {\nclass AdminerLoginPasswordLess extends Ad..."
    },
    {
      "step": "writeFile",
      "path": "/wordpress/adminer/adminer.php",
      "data": {
        "resource": "url",
        "url": "https://github.com/vrana/adminer/releases/download/v5.3.0/adminer-5.3.0-en...."
      }
    }
  ]
}
```

### V2 (Declarative)

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
      "path": "/wordpress/wp-content/mu-plugins/adminer-link.php",
      "data": "<?php\nadd_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {\n    $wp_menu->add_node(\n            array(\n                    'id'     => 'adminer',\n                    'title'  => 'Adminer',\n                    'href'   => '/adminer/?sqlite=&username=&db=%2Fwordpress%2Fwp-content%2Fdatabase%2F.ht.sqlite',\n            )\n);\n}, 100 );"
    },
    {
      "step": "mkdir",
      "path": "/wordpress/adminer"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/adminer/index.php",
      "data": "<?php\nfunction adminer_object() {\n    class AdminerLoginPasswordLess extends Adminer\\Plugin {\n        function login( $login, $password ) {\n            return true;\n        }\n\n        function head() {\n            echo '<style>\n                body { margin-top: 32px !important; }\n                #wp-admin-bar {\n                    position: fixed;\n                    top: 0;\n                    left: 0;\n                    right: 0;\n                    height: 32px;\n                    background: #23282d;\n                    z-index: 99999;\n                    font-family: -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif;\n                }\n                #wp-admin-bar a {\n                    color: #a7aaad;\n                    text-decoration: none;\n                    padding: 0 15px;\n                    line-height: 32px;\n                    display: inline-block;\n                    font-size: 13px;\n                }\n                #wp-admin-bar a:hover {\n                    color: #00b9eb;\n                    background: rgba(255,255,255,0.05);\n                }\n            </style>';\n        }\n\n        function loginForm() {\n            echo '<div id=\"wp-admin-bar\">\n                <a href=\"/wp-admin/\" class=\"wp-logo\">← WordPress Admin</a>\n            </div>';\n        }\n\n        function homepage() {\n            echo '<div id=\"wp-admin-bar homepage\">\n                <a href=\"/wp-admin/\" class=\"wp-logo\">← WordPress Admin</a>\n            </div>';\n        }\n    }\n    return new Adminer\\Plugins( array( new AdminerLoginPasswordLess() ) );\n}\nrequire '/wordpress/adminer/adminer.php';"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/adminer/adminer.php",
      "data": {
        "resource": "url",
        "url": "https://github.com/vrana/adminer/releases/download/v5.3.0/adminer-5.3.0-en.php"
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
          "step": "installAdminer"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

