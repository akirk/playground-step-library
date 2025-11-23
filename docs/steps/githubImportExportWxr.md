# `githubImportExportWxr` Step

Provide useful additional info.

**[View Source](../../steps/githubImportExportWxr.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `repo` | string | ✅ Yes | The WXR file resides in this GitHub repository. |
| `branch` | string | ❌ No | Which branch to use. |
| `filename` | string | ✅ Yes | Which filename and path to use. |
| `targetUrl` | string | ❌ No | Rewrite the exported paths to this destination URL. |


## Examples

### Basic Usage
```json
    {
          "step": "githubImportExportWxr",
          "vars": {
                "repo": "carstingaxion/gatherpress-demo-data",
                "filename": "GatherPress-demo-data-2024.xml"
          }
    }
```

### Advanced Usage
```json
{
          "step": "githubImportExportWxr",
          "vars": {
                "repo": "carstingaxion/gatherpress-demo-data",
                "branch": "main",
                "filename": "GatherPress-demo-data-2024.xml",
                "targetUrl": "https://gatherpress.test"
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
          "step": "githubImportExportWxr",
          "vars": {
                "repo": "carstingaxion/gatherpress-demo-data",
                "branch": "main",
                "filename": "GatherPress-demo-data-2024.xml",
                "targetUrl": "https://gatherpress.test"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

