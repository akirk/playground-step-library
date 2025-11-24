# `removeDashboardWidgets` Step

Remove widgets from the wp-admin dashboard.

**[View Source](../../steps/removeDashboardWidgets.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `welcome` | boolean | ❌ No | Remove Welcome Panel |
| `glance` | boolean | ❌ No | Remove At a Glance |
| `events` | boolean | ❌ No | Remove Upcoming Events |
| `quickpress` | boolean | ❌ No | Remove Quick Draft |
| `activity` | boolean | ❌ No | Remove Activity |
| `sitehealth` | boolean | ❌ No | Remove Site Health |


## Examples

### Basic Usage
```json
    {
          "step": "removeDashboardWidgets"
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
      "path": "/wordpress/wp-content/mu-plugins/remove-dashboard-widgets-0.php",
      "data": "<?php \nadd_action(\n'do_meta_boxes',\nstatic function ( $screen_id ) {\nglobal..."
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
        "filename": "remove-dashboard-widgets-0.php",
        "content": "<?php \nadd_action(\n\t'do_meta_boxes',\n\tstatic function ( $screen_id ) {\n\t\tglobal $wp_meta_boxes;\n\n\t\tif ( 'dashboard' !== $screen_id ) {\n\t\t\treturn;\n\t\t}\n\n\t\tif ( true ) {\n\t\t\tremove_action( 'welcome_panel', 'wp_welcome_panel' );\n\t\t}\n\t\t$default_widgets = array();\n\t\tif ( true ) {\n\t\t\t$default_widgets['dashboard_right_now'] = 'normal';\n\t\t}\n\t\tif ( true ) {\n\t\t\t$default_widgets['dashboard_primary'] = 'side';\n\t\t}\n\t\tif ( true ) {\n\t\t\t$default_widgets['dashboard_quick_press'] = 'side';\n\t\t}\n\t\tif ( true ) {\n\t\t\t$default_widgets['dashboard_activity'] = 'normal';\n\t\t}\n\t\tforeach ( $default_widgets as $widget_id => $context ) {\n\t\t\tremove_meta_box( $widget_id, $screen_id, $context );\n\t\t}\n\n\t\tif ( true ) {\n\t\t\t// Remove Site Health unless there are critical issues or recommendations.\n\t\t\tif ( isset( $wp_meta_boxes[ $screen_id ]['normal']['core']['dashboard_site_health'] ) ) {\n\t\t\t\t$get_issues = get_transient( 'health-check-site-status-result' );\n\t\t\t\tif ( false === $get_issues ) {\n\t\t\t\t\tremove_meta_box( 'dashboard_site_health', $screen_id, 'normal' );\n\t\t\t\t} else {\n\t\t\t\t\t$issue_counts = json_decode( $get_issues, true );\n\t\t\t\t\tif ( empty( $issue_counts['critical'] ) && empty( $issue_counts['recommended'] ) ) {\n\t\t\t\t\t\tremove_meta_box( 'dashboard_site_health', $screen_id, 'normal' );\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n);"
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
          "step": "removeDashboardWidgets",
          "vars": {
                "welcome": true,
                "glance": true,
                "events": true,
                "quickpress": true,
                "activity": true,
                "sitehealth": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

