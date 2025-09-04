# `githubImportExportWxr` Step

No description available.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | ❌ No | The WXR file resides in this GitHub repository. |
| `branch` | string | ❌ No | Which branch to use. |
| `filename` | string | ❌ No | Which filename and path to use. |
| `targetUrl` | string | ❌ No | Rewrite the exported paths to this destination URL. |


## Examples

### Basic Usage
```json
    {
          "step": "githubImportExportWxr",
          "repo": "carstingaxion/gatherpress-demo-data",
          "branch": "main",
          "filename": "GatherPress-demo-data-2024.xml",
          "targetUrl": "https://gatherpress.test"
    }
```

### Advanced Usage
```json
{
  "step": "githubImportExportWxr",
  "repo": "carstingaxion/gatherpress-demo-data",
  "branch": "main",
  "filename": "GatherPress-demo-data-2024.xml",
  "targetUrl": "https://gatherpress.test"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "githubImportExportWxr",
          "repo": "carstingaxion/gatherpress-demo-data",
          "branch": "main",
          "filename": "GatherPress-demo-data-2024.xml",
          "targetUrl": "https://gatherpress.test"
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
          "step": "githubImportExportWxr",
          "repo": "carstingaxion/gatherpress-demo-data",
          "branch": "main",
          "filename": "GatherPress-demo-data-2024.xml",
          "targetUrl": "https://gatherpress.test"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
