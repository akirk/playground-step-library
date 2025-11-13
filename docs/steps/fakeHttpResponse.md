# `fakeHttpResponse` Step

Fake a wp_remote_request() response.

## Type
⚡ **Custom Step**

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

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "fakeHttpResponse",
          "url": "",
          "response": "hello world"
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
          "step": "fakeHttpResponse",
          "url": "",
          "response": "hello world"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

