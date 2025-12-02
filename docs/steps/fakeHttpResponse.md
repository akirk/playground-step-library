# `fakeHttpResponse` Step

Fake a wp_remote_request() response.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=fakeHttpResponse)**

[View Source](../../steps/fakeHttpResponse.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | url | ✅ Yes | URL like https://wordpress.org/ |
| `response` | textarea | ❌ No | The data to return |


## Examples

### Basic Usage
```json
    {
          "step": "fakeHttpResponse",
          "vars": {
                "url": "https://wordpress.org/"
          }
    }
```

### Advanced Usage
```json
{
          "step": "fakeHttpResponse",
          "vars": {
                "url": "https://wordpress.org/",
                "response": "hello world"
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
      "path": "/wordpress/wp-content/mu-plugins/fake-http-response"
    },
    {
      "step": "writeFile",
      "path": "wordpress/wp-content/mu-plugins/fake-http-response.php",
      "data": "<?php\nadd_filter(\n'pre_http_request',\nfunction ( $preempt, $request, $url )..."
    },
    {
      "step": "writeFile",
      "path": "wordpress/wp-content/mu-plugins/fake-http-response/https-wordpress-org.txt",
      "data": "hello world"
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "muPlugins": [
    {
      "filename": "fake-http-response.php",
      "content": "<?php\nadd_filter(\n\t'pre_http_request',\n\tfunction ( $preempt, $request, $url ) {\n\t\t$filename = __DIR__ . '/fake-http-response/' . rtrim( preg_replace( '/[^a-z0-9-_]+/i', '-', $url ), '-' ) . '.txt';\n\t\tif ( file_exists( $filename ) ) {\n\t\t\t$content = file_get_contents( $filename );\n\t\t\t$content_type = substr( $content, 0, 1 ) === '<' ? 'text/html' : 'application/json';\n\t\t\treturn array(\n\t\t\t\t'headers'  => array(\n\t\t\t\t\t'content-type' => $content_type,\n\t\t\t\t),\n\t\t\t\t'body'     => $content,\n\t\t\t\t'response' => array(\n\t\t\t\t\t'code' => 200,\n\t\t\t\t),\n\t\t\t);\n\t\t}\n\t\terror_log( 'Not faked: ' . $url );\n\t\treturn $preempt;\n\t},\n\t10,\n\t3\n);"
    },
    {
      "filename": "fake-http-response/https-wordpress-org.txt",
      "content": "hello world"
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
          "step": "fakeHttpResponse",
          "vars": {
                "url": "https://wordpress.org/",
                "response": "hello world"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

