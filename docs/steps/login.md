# `login` Step

Login to the site.

**[View Source](../../steps/login.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`login`](../builtin-step-usage.md#login)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ✅ Yes | Password |
| `landingPage` | boolean | ❌ No | Change landing page to wp-admin |


## Examples

### Basic Usage
```json
    {
          "step": "login",
          "vars": {
                "username": "admin",
                "password": "password"
          }
    }
```

### Advanced Usage
```json
{
          "step": "login",
          "vars": {
                "username": "admin",
                "password": "password",
                "landingPage": true
          }
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "login",
      "username": "admin",
      "password": "password",
      "landingPage": "false"
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "applicationOptions": {
    "wordpress-playground": {
      "login": {}
    }
  }
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
          "vars": {
                "username": "admin",
                "password": "password",
                "landingPage": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

