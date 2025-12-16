# `enableIntl` Step

Enable PHP Intl extension support.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=enableIntl)**

[View Source](../../steps/enableIntl.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**


## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "enableIntl"
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "enableIntl"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

