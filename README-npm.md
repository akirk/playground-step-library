# playground-step-library

A compiler that transforms WordPress Playground blueprints with custom steps into blueprints with native steps.

## Installation

```bash
npm install playground-step-library
```
## 📚 Documentation

Comprehensive documentation for all steps is available:

- **[📖 Step Documentation](docs/)** - Complete documentation with examples
- **[📋 Steps Reference](docs/steps-reference.md)** - All steps in one page  
- **[🔍 Individual Steps](docs/steps/)** - Detailed docs for each step

## Usage

### Command Line Interface

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

### Programmatic API

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

**Usage:**
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
            postTitle: 'Welcome',
            postContent: '<p>Welcome to my site!</p>',
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

## How It Works

This compiler takes WordPress Playground blueprints that use custom steps (like `setSiteName`, `addPage`, etc.) and transforms them into blueprints that only use native WordPress Playground steps (like `runPHP`, `setSiteOptions`, etc.).

### Custom Step Structure

Custom steps are ES module JavaScript files in the `steps/` directory that export transformation functions:

```javascript
// steps/setSiteName.js
export function setSiteName(step) {
    return [
        {
            "step": "setSiteOptions",
            "options": {
                "blogname": step.vars.sitename,
                "blogdescription": step.vars.tagline
            }
        }
    ];
}

setSiteName.description = "Set the site name and tagline";
setSiteName.vars = [
    {
        "name": "sitename",
        "description": "Name of the site",
        "required": true,
        "samples": ["My WordPress Site"]
    },
    {
        "name": "tagline", 
        "description": "What the site is about",
        "required": true,
        "samples": ["Just another WordPress site"]
    }
];
```

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
      "postTitle": "Welcome Page",
      "postContent": "<p>Welcome to my WordPress site!</p>",
      "homepage": false
    }
  ]
}
```

### Output Example

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

## API Reference

### `PlaygroundStepLibrary`

#### Constructor

```javascript
new PlaygroundStepLibrary()
```

No parameters required - all steps are statically imported.

#### Methods

##### `compile(blueprint, options?)`
Compiles a blueprint with custom steps into a blueprint with native steps.

- `blueprint` (Object|string): Blueprint object or JSON string
- `options` (Object, optional): Compilation options
  - `options.landingPage` (string): Default landing page path
  - `options.features` (Object): Feature configuration
- Returns: Compiled blueprint object
- Throws: Error if compilation fails

##### `validateBlueprint(blueprint)`
Validates a blueprint structure and required variables.

- `blueprint` (Object|string): Blueprint object or JSON string  
- Returns: `{valid: boolean, error?: string}`

##### `getAvailableSteps()`
Returns information about all available custom steps.

- Returns: Object with step names as keys and step info as values

## Development

```bash
# Run tests
npm test

# Build package
npm run build
```

## Contributing

This package is part of the [WordPress Playground Step Library](https://github.com/akirk/playground-step-library) project. See the main repository for information on contributing custom steps.

## License

MIT