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

## Step Library Blueprint Format

Step library blueprints use a custom format with the `vars` object for step parameters. This format is different from native WordPress Playground blueprints.

### JSON Schema

A JSON schema is available for validation and IDE autocompletion:

```json
{
    "$schema": "https://akirk.github.io/playground-step-library/step-library-schema.json",
    "steps": [
        {
            "step": "setSiteName",
            "vars": {
                "sitename": "My Site",
                "tagline": "A WordPress site"
            }
        }
    ]
}
```

### Format Structure

```typescript
interface StepLibraryBlueprint {
    $schema?: string;                    // Schema reference for validation
    meta?: { title?: string };           // Blueprint metadata
    title?: string;                      // Alternative to meta.title
    landingPage?: string;                // Page to navigate to after setup
    preferredVersions?: {
        wp?: string;                     // WordPress version
        php?: string;                    // PHP version
    };
    steps: Array<{
        step: string;                    // Step type name
        vars?: Record<string, any>;      // Step parameters (nested format)
        [key: string]: any;              // Step parameters (flat format)
    }>;
}
```

Both nested (`vars: { sitename: "..." }`) and flat (`sitename: "..."`) formats are supported for step parameters.

## V1 vs V2 Compilation

The library supports two output formats via the main `PlaygroundStepLibrary` class:
- **V1 Format** (`compile()`) - Outputs imperative blueprints with `steps` array
- **V2 Format** (`compileV2()`) - Outputs declarative blueprints with schema properties

Additionally, the `transpile()` method converts native V1 blueprints to V2 format.

> **Note:** Transpilation is not a fully-featured capability. It's a byproduct of the decompilation functionality that was added to allow pasting native blueprints in the UI. Complex blueprints (especially those with custom `runPHP` code) may not transpile accurately.

### V1 Compilation Example

```javascript
import PlaygroundStepLibrary from 'playground-step-library';

const compiler = new PlaygroundStepLibrary();

const blueprint = {
    steps: [
        { step: 'setSiteName', sitename: 'My Demo Site', tagline: 'A WordPress Playground demo' },
        { step: 'addPage', title: 'Welcome Page', content: '<p>Welcome!</p>' }
    ]
};

const v1 = compiler.compile(blueprint);
// {
//   "steps": [
//     { "step": "setSiteOptions", "options": { "blogname": "My Demo Site", "blogdescription": "A WordPress Playground demo" } },
//     { "step": "runPHP", "code": "<?php require_once '/wordpress/wp-load.php';\n$page_args = array(...);", "progress": { "caption": "addPage: Welcome Page" } }
//   ]
// }
```

### V2 Compilation Example

```javascript
import PlaygroundStepLibrary from 'playground-step-library';

const compiler = new PlaygroundStepLibrary();

const blueprint = {
    steps: [
        { step: 'setSiteName', sitename: 'My Demo Site', tagline: 'A WordPress Playground demo' },
        { step: 'addPage', title: 'Welcome Page', content: '<p>Welcome!</p>' }
    ]
};

const v2 = compiler.compileV2(blueprint);
// {
//   "version": 2,
//   "siteOptions": { "blogname": "My Demo Site", "blogdescription": "A WordPress Playground demo" },
//   "content": [
//     { "type": "posts", "source": { "post_title": "Welcome Page", "post_content": "<p>Welcome!</p>", "post_type": "page", "post_status": "publish" } }
//   ]
// }
```

### Transpilation Example (V1 Native → V2)

```javascript
// Native V1 blueprint (from WordPress Playground)
const nativeV1 = {
    landingPage: '/wp-admin/',
    steps: [
        { step: 'installPlugin', pluginData: { resource: 'wordpress.org/plugins', slug: 'woocommerce' } },
        { step: 'setSiteOptions', options: { blogname: 'My Store' } },
        { step: 'login' }
    ]
};

const result = compiler.transpile(nativeV1);
// result.v2Blueprint:
// {
//   "version": 2,
//   "plugins": ["woocommerce"],
//   "siteOptions": { "blogname": "My Store" },
//   "applicationOptions": { "wordpress-playground": { "login": true, "landingPage": "/wp-admin/" } }
// }
// result.decompilerResult.confidence: "high"
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

##### `compileV2(blueprint, options?)`
Compiles a blueprint with custom steps into a v2 blueprint with declarative schema.

- `blueprint` (Object|string): Blueprint object or JSON string
- `options` (Object, optional): Same as `compile()`
- Returns: Compiled v2 blueprint with declarative properties (`plugins`, `themes`, `siteOptions`, `content`, etc.)
- Throws: Error if compilation fails

```javascript
const compiler = new PlaygroundStepLibrary();

const v2Blueprint = compiler.compileV2({
    steps: [
        { step: 'installPlugin', url: 'https://wordpress.org/plugins/gutenberg/' },
        { step: 'setSiteName', sitename: 'My Site', tagline: 'A tagline' }
    ]
});
// Output: { version: 2, plugins: ['gutenberg'], siteOptions: { blogname: 'My Site', blogdescription: 'A tagline' } }
```

##### `transpile(v1Blueprint)`
Transpiles a native V1 blueprint to V2 format. Decompiles to step library format, then compiles to V2.

> **Limited support:** This method leverages decompilation capabilities that were primarily added to enable pasting native blueprints in the UI. It works best with blueprints using common native steps (`installPlugin`, `setSiteOptions`, `login`, etc.) but may not accurately handle complex `runPHP` code or unusual step configurations.

- `v1Blueprint` (Object): Native WordPress Playground V1 blueprint
- Returns: `TranspileResult` object

```typescript
interface TranspileResult {
    v2Blueprint: BlueprintV2Declaration;           // The transpiled V2 blueprint
    stepLibraryBlueprint: { steps: Array<any> };   // Intermediate step library format
    decompilerResult: DecompilerResult;            // Decompilation metadata
}
```

```javascript
const compiler = new PlaygroundStepLibrary();

// Native V1 blueprint from WordPress Playground
const v1Native = {
    landingPage: '/wp-admin/',
    steps: [
        { step: 'installPlugin', pluginData: { resource: 'wordpress.org/plugins', slug: 'woocommerce' } },
        { step: 'setSiteOptions', options: { blogname: 'My Store' } },
        { step: 'login' }
    ]
};

const result = compiler.transpile(v1Native);
console.log(result.v2Blueprint);
// Output: { version: 2, plugins: ['woocommerce'], siteOptions: { blogname: 'My Store' }, applicationOptions: { 'wordpress-playground': { login: true, landingPage: '/wp-admin/' } } }
console.log(result.decompilerResult.confidence); // 'high'
```

##### `validateBlueprint(blueprint)`
Validates a blueprint structure and required variables.

- `blueprint` (Object|string): Blueprint object or JSON string
- Returns: `{valid: boolean, error?: string}`

##### `getAvailableSteps()`
Returns information about all available custom steps.

- Returns: Object with step names as keys and step info as values

### `BlueprintDecompiler`

Converts native WordPress Playground blueprints (both V1 and V2 formats) back into step library blueprints with custom steps.

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

#### Supported Native Steps (V1)

The decompiler can convert these native V1 step types:

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

Top-level V1 blueprint properties like `plugins`, `login`, `siteOptions`, `constants`, and `landingPage` are also handled.

#### Supported V2 Properties

The decompiler automatically detects V2 blueprints (those with `version: 2`) and handles these properties:

| V2 Property | Decompiled To |
|-------------|---------------|
| `plugins` | `installPlugin` steps |
| `themes` | `installTheme` steps |
| `siteOptions` | `setSiteName` and `setSiteOption` steps |
| `content` | `addPage` or `addPost` steps |
| `users` | `createUser` steps |
| `constants` | `debug` step |
| `applicationOptions.wordpress-playground.login` | `login` step |
| `applicationOptions.wordpress-playground.landingPage` | `setLandingPage` step |
| `muPlugins` | `muPlugin` steps |
| `additionalStepsAfterExecution` | Decompiled using V1 logic |

#### V2 Example

```javascript
const v2Blueprint = {
    version: 2,
    plugins: ['gutenberg', 'woocommerce'],
    themes: ['flavor'],
    siteOptions: {
        blogname: 'My Store',
        blogdescription: 'The best products'
    },
    content: [
        {
            type: 'posts',
            source: {
                post_title: 'Welcome',
                post_content: '<p>Hello!</p>',
                post_type: 'page',
                post_status: 'publish'
            }
        }
    ],
    users: [
        { username: 'shop_manager', role: 'shop_manager' }
    ],
    applicationOptions: {
        'wordpress-playground': {
            login: {},
            landingPage: '/wp-admin/'
        }
    }
};

const result = decompiler.decompile(v2Blueprint);
// Result contains installPlugin, installTheme, setSiteName, addPage, createUser, login, setLandingPage steps
```
