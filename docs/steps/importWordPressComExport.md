# `importWordPressComExport` Step

Import a WordPress.com export file (WXR in a ZIP)

**[View Source](../../steps/importWordPressComExport.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `unzip`, `runPHP`, `importWxr`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WordPress.com export ZIP file |


## Examples

### Basic Usage
```json
    {
          "step": "importWordPressComExport",
          "url": ""
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/tmp/"
    },
    {
      "step": "unzip",
      "zipFile": {
        "resource": "url",
        "url": ""
      },
      "extractToPath": "/tmp"
    },
    {
      "step": "runPHP",
      "code": "<?php\n$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIter..."
    },
    {
      "step": "importWxr",
      "file": {
        "resource": "vfs",
        "path": "/tmp/export.xml"
      }
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
          "step": "importWordPressComExport",
          "url": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

