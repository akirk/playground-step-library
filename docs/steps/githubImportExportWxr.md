# `githubImportExportWxr` Step

Provide useful additional info.

**[View Source](../../steps/githubImportExportWxr.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp), [`setSiteOptions`](../builtin-step-usage.md#setsiteoptions), [`defineWpConfigConsts`](../builtin-step-usage.md#definewpconfigconsts), [`unzip`](../builtin-step-usage.md#unzip), [`writeFile`](../builtin-step-usage.md#writefile), [`installPlugin`](../builtin-step-usage.md#installplugin)

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

## Compiled Output

### Blueprint V1

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

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "\n<?php require_once '/wordpress/wp-load.php';\nforeach ( array( 'post', 'page', 'attachment', 'revision', 'nav_menu_item' ) as $post_type ) {\n$posts = get_posts( array('posts_per_page' => -1, 'post_type' => $post_type ) );\nforeach ($posts as $post) wp_delete_post($post->ID, true);\n}\n"
      },
      "progress": {
        "caption": "Deleting all posts and pages"
      },
      "queryParams": {
        "gh-ensure-auth": "yes",
        "ghexport-repo-url": "https://github.com/carstingaxion/gatherpress-demo-data",
        "ghexport-pr-action": "create",
        "ghexport-content-type": "custom-paths",
        "ghexport-repo-root": "/",
        "ghexport-playground-root": "/wordpress/wp-content/gatherpress-demo-data-main",
        "ghexport-path": ".",
        "ghexport-allow-include-zip": "no"
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
        "url": "https://raw.githubusercontent.com/carstingaxion/wordpress-export-to-server/main/wordpress-export-to-server.php"
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
      "code": {
        "filename": "code.php",
        "content": "\n\t\t<?php require '/wordpress/wp-load.php';\n\t\t$path = realpath( '/wordpress/wp-content/gatherpress-demo-data-main/GatherPress-demo-data-2024.xml' );\n\t\t$logger = new WP_Importer_Logger_CLI();\n\t\t$logger->min_level = 'info';\n\t\t$options = array( 'fetch_attachments' => false, 'default_author' => 1 );\n\t\t$importer = new WXR_Importer( $options );\n\t\t$importer->set_logger( $logger );\n\t\t$result = $importer->import( $path );\n\t\t"
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

