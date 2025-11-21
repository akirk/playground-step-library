# `createUser` Step

Create a new user.

**[View Source](../../steps/createUser.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp), [`login`](../builtin-step-usage.md#login)

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

### V1 (Imperative)

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

### V2 (Declarative)

```json
{
  "version": 2,
  "users": [
    {
      "username": "user",
      "email": "user@example.com",
      "role": "administrator",
      "meta": {
        "display_name": "User"
      }
    }
  ],
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": "<?php\nrequire_once '/wordpress/wp-load.php';\n$user = get_user_by( 'login', 'user' );\nif ( $user ) {\n\twp_set_password( 'password', $user->ID );\n}"
    }
  ],
  "applicationOptions": {
    "wordpress-playground": {
      "login": {
        "username": "user",
        "password": "password"
      }
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

