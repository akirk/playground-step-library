# `fakeHttpResponse` Step

Fake a wp_remote_request() response.

**[View Source](../../steps/fakeHttpResponse.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | url | ❌ No | URL like https://wordpress.org/ |
| `response` | textarea | ❌ No | The data to return |


## Examples

### Basic Usage
```json
    {
          "step": "fakeHttpResponse",
          "url": "",
          "response": "hello world"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins/fake-http-response"
    },
    {
      "step": "writeFile",
      "path": "wordpress/wp-content/mu-plugins/fake-http-response.php",
      "data": "<?php\nadd_filter(\n'pre_http_request',\nfunction ( $preempt, $request, $url )..."
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "fakeHttpResponse",
          "url": "",
          "response": "hello world"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

