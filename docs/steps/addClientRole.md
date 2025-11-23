# `addClientRole` Step

Adds a role for clients with additional capabilities than editors, but not quite admin.

**[View Source](../../steps/addClientRole.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `displayName` | string | ✅ Yes | Display name for the client role |


## Examples

### Basic Usage
```json
    {
          "step": "addClientRole",
          "vars": {
                "displayName": "Client"
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
      "path": "/wordpress/wp-content/mu-plugins/add-client-role-0.php",
      "data": "<?php \nadd_action(\n'init',\nstatic function () {\n// The client role inherits..."
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
        "filename": "add-client-role.php",
        "content": "<?php \nadd_action(\n\t'init',\n\tstatic function () {\n\t\t// The client role inherits all capabilities from the editor role.\n\t\t$editor_role = get_role( 'editor' );\n\t\tif ( ! $editor_role ) {\n\t\t\treturn;\n\t\t}\n\n\t\t$display_name    = 'undefined';\n\t\t$additional_caps = array(\n\t\t\t'update_core',\n\t\t\t'update_plugins',\n\t\t\t'update_themes',\n\t\t);\n\n\t\t$capabilities = $editor_role->capabilities;\n\n\t\t// If an indexed array, transform it to a capabilities map with each capability granted.\n\t\tif ( isset( $additional_caps[0] ) ) {\n\t\t\t$additional_caps = array_fill_keys( $additional_caps, true );\n\t\t}\n\t\tforeach ( $additional_caps as $cap => $grant ) {\n\t\t\t// Do not allow removing capabilities.\n\t\t\tif ( isset( $capabilities[ $cap ] ) && $capabilities[ $cap ] ) {\n\t\t\t\tcontinue;\n\t\t\t}\n\t\t\t$capabilities[ $cap ] = $grant;\n\t\t}\n\n\t\t$roles = array(\n\t\t\t'client' => array(\n\t\t\t\t'display_name' => $display_name,\n\t\t\t\t'capabilities' => $capabilities,\n\t\t\t),\n\t\t);\n\n\t\t// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize\n\t\t$roles_hash      = md5( serialize( $roles ) );\n\t\t$roles_installed = get_option( 'client_role_installed' );\n\t\tif ( $roles_installed !== $roles_hash ) {\n\t\t\tforeach ( $roles as $role => $data ) {\n\t\t\t\tremove_role( $role );\n\t\t\t\tadd_role( $role, $data['display_name'], $data['capabilities'] );\n\t\t\t}\n\t\t\tupdate_option( 'client_role_installed', $roles_hash );\n\t\t}\n\t}\n);\n"
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
          "step": "addClientRole",
          "vars": {
                "displayName": "Client"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

