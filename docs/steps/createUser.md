# `createUser` Step

Create a new user.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=createUser)**

[View Source](../../steps/createUser.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp), [`login`](../builtin-step-usage.md#login)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
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
          "vars": {
                "username": "user",
                "password": "password",
                "role": "administrator"
          }
    }
```

### Advanced Usage
```json
{
          "step": "createUser",
          "vars": {
                "username": "user",
                "password": "password",
                "role": "editor",
                "display_name": "User",
                "email": "wordpress@example.org",
                "login": true
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

### Blueprint V2

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
          "vars": {
                "username": "user",
                "password": "password",
                "role": "administrator",
                "display_name": "User",
                "email": "wordpress@example.org",
                "login": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

