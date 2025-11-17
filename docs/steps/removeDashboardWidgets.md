# `removeDashboardWidgets` Step

Remove widgets from the wp-admin dashboard.

**[View Source](../../steps/removeDashboardWidgets.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
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
          "step": "removeDashboardWidgets",
          "welcome": "true",
          "glance": "true",
          "events": "true",
          "quickpress": "true",
          "activity": "true",
          "sitehealth": "true"
    }
```

### Advanced Usage
```json
{
  "step": "removeDashboardWidgets",
  "welcome": "true",
  "glance": "true",
  "events": "true",
  "quickpress": "true",
  "activity": "true",
  "sitehealth": "true"
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
      "path": "/wordpress/wp-content/mu-plugins/remove-dashboard-widgets.php",
      "data": "<?php\nadd_action(\n'do_meta_boxes',\nstatic function ( $screen_id ) {\nglobal ..."
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
          "welcome": "true",
          "glance": "true",
          "events": "true",
          "quickpress": "true",
          "activity": "true",
          "sitehealth": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

