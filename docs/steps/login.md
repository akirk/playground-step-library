# `login` Step

Login to the site.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=login)**

[View Source](../../steps/login.ts) to understand how this step is implemented.

## Type
🔧 **Built-in Step**

**Compiles to:** [`login`](../builtin-step-usage.md#login)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ❌ No | Password |
| `landingPage` | boolean | ❌ No | Change landing page to wp-admin |


## Examples

### Basic Usage
```json
    {
          "step": "login",
          "vars": {
                "username": "admin"
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

### Blueprint V1

```json
{
  "landingPage": "/wp-admin/",
  "steps": [
    {
      "step": "login",
      "username": "admin",
      "password": "password"
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "applicationOptions": {
    "wordpress-playground": {
      "login": true,
      "landingPage": "/wp-admin/"
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

