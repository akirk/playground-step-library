# `login` Step

Login to the site.

**[View Source](../../steps/login.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** `login`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ✅ Yes | Password |
| `landingPage` | boolean | ❌ No | Change landing page to wp-admin |


## Examples

### Basic Usage
```json
    {
          "step": "login",
          "username": "admin",
          "password": "password",
          "landingPage": "true"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "login",
      "username": "admin",
      "password": "password"
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
          "step": "login",
          "username": "admin",
          "password": "password",
          "landingPage": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

