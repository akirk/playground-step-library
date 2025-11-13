# `createUser` Step

Create a new user.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ✅ Yes | Password |
| `role` | text | ✅ Yes | Role |
| `display_name` | string | ❌ No | Display Name |
| `email` | string | ❌ No | E-Mail |
| `login` | boolean | ❌ No | Immediately log the user in |


## Examples

### Basic Usage
```json
    {
          "step": "createUser",
          "username": "user",
          "password": "password",
          "role": "administrator",
          "display_name": "User",
          "email": "",
          "login": "true"
    }
```

### Advanced Usage
```json
{
  "step": "createUser",
  "username": "user",
  "password": "password",
  "role": "editor",
  "display_name": "User",
  "email": "wordpress@example.org",
  "login": "true"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "createUser",
          "username": "user",
          "password": "password",
          "role": "administrator",
          "display_name": "User",
          "email": "",
          "login": "true"
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
          "step": "createUser",
          "username": "user",
          "password": "password",
          "role": "administrator",
          "display_name": "User",
          "email": "",
          "login": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

