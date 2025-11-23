# `createUser` Step

Create a new user.

**[View Source](../../steps/createUser.ts)**

## Type
⚡ **Custom Step**


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
                "email": "",
                "login": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

