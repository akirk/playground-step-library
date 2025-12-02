# `importWordPressComExport` Step

Import a WordPress.com export file (WXR in a ZIP)

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=importWordPressComExport)**

[View Source](../../steps/importWordPressComExport.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`unzip`](../builtin-step-usage.md#unzip), [`runPHP`](../builtin-step-usage.md#runphp), [`importWxr`](../builtin-step-usage.md#importwxr)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WordPress.com export ZIP file |


## Examples

### Basic Usage
```json
    {
          "step": "importWordPressComExport",
          "vars": {
                "url": "https://example.com"
          }
    }
```

## Compiled Output

### Blueprint V1

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

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
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
      "code": {
        "filename": "code.php",
        "content": "<?php\n$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( '/tmp/' ) );\nforeach ( $iterator as $file ) {\n\tif ( ! $file->isFile() || 'xml' !== $file->getExtension() ) continue;\n\trename( $file->getPathname(), '/tmp/export.xml' );\n\texit;\n}\n"
      }
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
          "vars": {
                "url": "https://example.com"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

