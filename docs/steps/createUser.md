# `createUser` Step

Create a new user.

**[View Source](../../steps/createUser.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `runPHP`, `login`

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

## Compiled Output

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php'; $data = array( 'user_login' =>...",
      "progress": {
        "caption": "createUser: user"
      }
    },
    {
      "step": "login",
      "username": "user",
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

