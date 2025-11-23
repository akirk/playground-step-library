# `showAdminNotice` Step

Show an admin notice in the dashboard.

**[View Source](../../steps/showAdminNotice.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | string | ✅ Yes | The notice to be displayed |
| `type` | select | ❌ No | The type of notice |
| `dismissible` | boolean | ❌ No | Allow to dismiss |


## Examples

### Basic Usage
```json
    {
          "step": "showAdminNotice",
          "vars": {
                "text": "Welcome to WordPress Playground!"
          }
    }
```

### Advanced Usage
```json
{
          "step": "showAdminNotice",
          "vars": {
                "text": "This is a demo of the Step Library",
                "type": "success",
                "dismissible": true
          }
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
      "path": "/wordpress/wp-content/mu-plugins/show-admin-notice-0-0.php",
      "data": "<?php \nadd_action(\n'admin_notices',\nfunction() {\n$dismissed = get_user_opti..."
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
      "file": {
        "filename": "show-admin-notice-0.php",
        "content": "<?php \nadd_action(\n\t'admin_notices',\n\tfunction() {\n\t\t$dismissed = get_user_option( 'dismissed_expose_blueprint_notice-0', get_current_user_id() );\n\n\t\tif ( $dismissed ) {\n\t\t\treturn;\n\t\t}\n\n\t\techo '<div class=\"notice notice-success is-dismissible\" id=\"custom-admin-notice-0\"><p>' . esc_html( 'Welcome to WordPress Playground!' ) . '</p></div>';\n\t}\n);\nadd_action('wp_ajax_dismiss_custom-admin-notice-0', function() {\n\tcheck_ajax_referer('custom-admin-notice-0', 'nonce');\n\n\t$user_id = get_current_user_id();\n\tif ( $user_id ) {\n\t\tupdate_user_option($user_id, 'dismissed_expose_blueprint_notice-0', 1, false);\n\t\twp_send_json_success();\n\t} else {\n\t\twp_send_json_error('User not found');\n\t}\n} );\n\nadd_action('admin_footer', function() {\n\t?>\n\t<script type=\"text/javascript\">\n\tjQuery(document).ready( function($) {\n\t\tvar ajaxurl = ' echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>';\n\t\tvar nonce = ' echo esc_html( wp_create_nonce( 'custom-admin-notice-0' ) ); ?>';\n\n\t\t$( '#custom-admin-notice-0' ).on( 'click', '.notice-dismiss', function() {\n\t\t\t$.ajax({\n\t\t\t\turl: ajaxurl,\n\t\t\t\ttype: 'POST',\n\t\t\t\tdata: {\n\t\t\t\t\taction: 'dismiss_custom-admin-notice-0',\n\t\t\t\t\tnonce: nonce\n\t\t\t\t}\n\t\t\t});\n\t\t});\n\t});\n\t</script>\n\t\n} );\n"
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
          "step": "showAdminNotice",
          "vars": {
                "text": "Welcome to WordPress Playground!",
                "type": "success",
                "dismissible": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

