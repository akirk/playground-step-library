# Programmatic API

The npm package provides a compiler to transform WordPress Playground blueprints with custom steps into blueprints with native steps. It's available as an [npm package](https://www.npmjs.com/package/playground-step-library).

## Installation

```bash
npm install playground-step-library
```

## Command Line Interface

```bash
# Compile a blueprint
node bin/cli.js blueprint.json

# Compile with pretty output
node bin/cli.js blueprint.json --pretty

# Save to file
node bin/cli.js blueprint.json --output compiled.json

# Validate a blueprint
node bin/cli.js blueprint.json --validate

# List available custom steps
node bin/cli.js --list-steps
```

## Usage

**TypeScript / JavaScript (ES Modules):**
```javascript
import PlaygroundStepLibrary from 'playground-step-library';
```

**Browser (ES Modules):**
```html
<script type="module">
import PlaygroundStepLibrary from 'https://unpkg.com/playground-step-library/lib/index.js';
// or from your local installation
// import PlaygroundStepLibrary from './node_modules/playground-step-library/lib/index.js';

// Make it globally available if needed
window.PlaygroundStepLibrary = PlaygroundStepLibrary;
</script>
```

**Basic Usage:**
```javascript
// Initialize compiler
const compiler = new PlaygroundStepLibrary();

// Compile a blueprint
const blueprint = {
    steps: [
        {
            step: 'setSiteName',
            sitename: 'My Site',
            tagline: 'A WordPress site'
        },
        {
            step: 'addPage',
            title: 'Welcome',
            content: '<p>Welcome to my site!</p>',
            homepage: true
        }
    ]
};

const compiledBlueprint = compiler.compile(blueprint);
console.log(JSON.stringify(compiledBlueprint, null, 2));

// Validate a blueprint
const validation = compiler.validateBlueprint(blueprint);
if (!validation.valid) {
    console.error('Validation error:', validation.error);
}

// Get available custom steps
const steps = compiler.getAvailableSteps();
console.log('Available steps:', Object.keys(steps));
```

## V1 vs V2 Compilers

The library provides two compilers:
- **V1 Compiler** (`PlaygroundStepLibrary`) - Outputs imperative blueprints with `steps` array
- **V2 Compiler** (`PlaygroundStepLibraryV2`) - Outputs declarative blueprints with schema properties

### Input Example

```json
{
  "steps": [
    {
      "step": "setSiteName",
      "sitename": "My Demo Site",
      "tagline": "A WordPress Playground demo"
    },
    {
      "step": "addPage",
      "title": "Welcome Page",
      "content": "<p>Welcome to my WordPress site!</p>",
      "homepage": false
    }
  ]
}
```

### V1 Output Example (Imperative)

```json
{
  "steps": [
    {
      "step": "setSiteOptions",
      "options": {
        "blogname": "My Demo Site",
        "blogdescription": "A WordPress Playground demo"
      }
    },
    {
      "step": "runPHP",
      "code": "\n<?php require_once '/wordpress/wp-load.php';\n$page_args = array(\n\t'post_type'    => 'page',\n\t'post_status'  => 'publish',\n\t'post_title'   => 'Welcome Page',\n\t'post_content' => '<p>Welcome to my WordPress site!</p>',\n);\n$page_id = wp_insert_post( $page_args );"
    }
  ]
}
```

### V2 Output Example (Declarative)

```json
{
  "siteOptions": {
    "blogname": "My Demo Site",
    "blogdescription": "A WordPress Playground demo"
  },
  "content": [
    {
      "type": "posts",
      "source": {
        "post_title": "Welcome Page",
        "post_content": "<p>Welcome to my WordPress site!</p>",
        "post_type": "page",
        "post_status": "publish"
      }
    }
  ]
}
```

## API Reference

### `PlaygroundStepLibrary` (V1 Compiler)

Compiles to imperative Blueprint v1 format.

#### Constructor

```javascript
new PlaygroundStepLibrary()
```

No parameters required - all steps are statically imported.

#### Methods

##### `compile(blueprint, options?)`
Compiles a blueprint with custom steps into a v1 blueprint with native steps.

- `blueprint` (Object|string): Blueprint object or JSON string
- `options` (Object, optional): Compilation options
  - `options.landingPage` (string): Default landing page path
  - `options.features` (Object): Feature configuration
- Returns: Compiled v1 blueprint object with `steps` array
- Throws: Error if compilation fails

##### `validateBlueprint(blueprint)`
Validates a blueprint structure and required variables.

- `blueprint` (Object|string): Blueprint object or JSON string
- Returns: `{valid: boolean, error?: string}`

##### `getAvailableSteps()`
Returns information about all available custom steps.

- Returns: Object with step names as keys and step info as values

### `PlaygroundStepLibraryV2` (V2 Compiler)

Compiles to declarative Blueprint v2 format.

#### Constructor

```javascript
import { PlaygroundStepLibraryV2 } from 'playground-step-library';
const compiler = new PlaygroundStepLibraryV2();
```

#### Methods

##### `compile(blueprint, options?)`
Compiles a blueprint with custom steps into a v2 blueprint with declarative schema.

- `blueprint` (Object|string): Blueprint object or JSON string
- `options` (Object, optional): Same as v1 compiler
- Returns: Compiled v2 blueprint with declarative properties (`content`, `users`, `plugins`, etc.)
- Throws: Error if compilation fails

See [Architecture Documentation](architecture.md) for details on how steps implement both v1 and v2 compilation.

### `BlueprintDecompiler`

Converts native WordPress Playground blueprints back into step library blueprints with custom steps.

#### Constructor

```javascript
import { BlueprintDecompiler } from 'playground-step-library';
const decompiler = new BlueprintDecompiler();
```

#### Methods

##### `decompile(nativeBlueprint)`
Decompiles a native blueprint into a step library blueprint.

- `nativeBlueprint` (Object): Native WordPress Playground blueprint
- Returns: `DecompilerResult` object

#### DecompilerResult

```typescript
interface DecompilerResult {
    steps: Array<StepLibraryStepDefinition>;  // Decompiled custom steps
    unmappedSteps: Array<any>;                 // Native steps that couldn't be mapped
    confidence: 'high' | 'medium' | 'low';     // Confidence score
    warnings: Array<string>;                   // Warning messages
}
```

#### Usage Example

```javascript
import { BlueprintDecompiler } from 'playground-step-library';

const decompiler = new BlueprintDecompiler();

// Native blueprint from WordPress Playground
const nativeBlueprint = {
    steps: [
        {
            step: 'installPlugin',
            pluginData: {
                resource: 'wordpress.org/plugins',
                slug: 'gutenberg'
            }
        },
        {
            step: 'setSiteOptions',
            options: {
                blogname: 'My Site',
                blogdescription: 'A demo site'
            }
        }
    ],
    login: true,
    landingPage: '/wp-admin/'
};

const result = decompiler.decompile(nativeBlueprint);
console.log(JSON.stringify(result.steps, null, 2));
// Output:
// [
//   { "step": "login", "username": "admin", "password": "password", "landingPage": false },
//   { "step": "installPlugin", "url": "https://wordpress.org/plugins/gutenberg/", "prs": false },
//   { "step": "setSiteName", "sitename": "My Site", "tagline": "A demo site" },
//   { "step": "setLandingPage", "landingPage": "/wp-admin/" }
// ]

// Check confidence and warnings
console.log('Confidence:', result.confidence);
console.log('Unmapped steps:', result.unmappedSteps.length);
console.log('Warnings:', result.warnings);
```

#### Supported Native Steps

The decompiler can convert these native step types:

| Native Step | Decompiled To |
|-------------|---------------|
| `installPlugin` | `installPlugin` (with URL) |
| `installTheme` | `installTheme` (with URL) |
| `runPHP` | `blockExamples`, `importFriendFeeds`, `addPage`/`addPost`, or generic `runPHP` |
| `writeFile` | `muPlugin` or `addFilter` |
| `defineWpConfigConsts` | `debug` |
| `setSiteOptions` | `setSiteName` or `setSiteOption` |
| `login` | `login` |
| `wp-cli` | `runWpCliCommand` |

Top-level blueprint properties like `plugins`, `login`, `siteOptions`, `constants`, and `landingPage` are also handled.
