# `dontLogin` Step

Prevent automatic login (Playground logs in as admin by default).

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=dontLogin)**

[View Source](../../steps/dontLogin.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**


## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "dontLogin"
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "dontLogin"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

