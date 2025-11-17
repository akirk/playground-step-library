# `githubImportExportWxr` Step

Provide useful additional info.

**[View Source](../../steps/githubImportExportWxr.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `runPHP`, `setSiteOptions`, `defineWpConfigConsts`, `unzip`, `writeFile`, `installPlugin`

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

## Compiled Output

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php';\nforeach ( array( 'post', 'page...",
      "progress": {
        "caption": "Deleting all posts and pages"
      }
    },
    {
      "step": "setSiteOptions",
      "options": {
        "wordpress_export_to_server__file": "GatherPress-demo-data-2024.xml",
        "wordpress_export_to_server__owner_repo_branch": "carstingaxion/gatherpress-demo-data/main",
        "wordpress_export_to_server__export_home": "https://gatherpress.test"
      }
    },
    {
      "step": "defineWpConfigConsts",
      "consts": {
        "UPLOADS": "wp-content/carstingaxion-gatherpress-demo-data-main"
      }
    },
    {
      "step": "unzip",
      "zipFile": {
        "resource": "git:directory",
        "url": "https://github.com/carstingaxion/gatherpress-demo-data",
        "ref": "main",
        "refType": "branch"
      },
      "extractToPath": "/wordpress/wp-content"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/wordpress-export-to-server.php",
      "data": {
        "resource": "url",
        "url": "https://raw.githubusercontent.com/carstingaxion/wordpress-export-to-server/..."
      }
    },
    {
      "step": "installPlugin",
      "pluginZipFile": {
        "resource": "git:directory",
        "url": "https://github.com/humanmade/WordPress-Importer",
        "ref": "master",
        "refType": "branch"
      }
    },
    {
      "step": "runPHP",
      "code": "<?php require '/wordpress/wp-load.php';\n$path = realpath( '/wordpress/wp-co..."
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

