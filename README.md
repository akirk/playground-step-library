# WordPress Playground Step Library

In this Github repository we collect custom [blueprint steps](https://wordpress.github.io/wordpress-playground/blueprints/steps/) for [WordPress Playground](https://wordpress.github.io/wordpress-playground/).

## Web UI

You can then use those custom steps [in our Step Builder](https://akirk.github.io/playground-step-library/) to create more complex WordPress Playground setups more easily.

## NPM Package

You can also use the steps in your own projects by using the [npm package](#using-as-npm-package).

## 📚 Documentation

Comprehensive documentation for all steps is available:

- **[📖 Step Documentation](docs/)** - Complete documentation with examples
- **[📋 Steps Reference](docs/steps-reference.md)** - All steps in one page  
- **[🔍 Individual Steps](docs/steps/)** - Detailed docs for each step

## What does it mean?

You can tell WordPress Playground what to do before it loads using a [Blueprint JSON](https://wordpress.github.io/wordpress-playground/blueprints) file. There are [a number of builtin steps provided](https://wordpress.github.io/wordpress-playground/blueprints/steps/) that in combination can make it do powerful things.

Now, this tool collects custom steps that make it easier to specify more complex tasks. The steps get transformed into builtin steps to form a valid, final blueprint that can be executed by WordPress Playground.

## How does it work?

In the [Step Library UI](https://akirk.github.io/playground-step-library/) you can select the steps you want to use by clicking or dragging. On each step you can modify the variables if any. You can also reorder the steps when necessary.

The final blueprint is immediately updated so that you can click the "Launch in Playground" to see if it achieves what you try to do.

## Sharing

To make it easy to share what you are building, the URL of the page is updated with the blueprint. You can copy the URL and share it with others.

You can also share the Playground URL which contains the final blueprint.

## Screenshot
[![step-library](https://github.com/akirk/playground-step-library/assets/203408/c536785b-2c6b-44bd-b1cd-4f1b72c074d1)](https://akirk.github.io/playground-step-library/#eyJzdGVwcyI6W3sic3RlcCI6ImNyZWF0ZVVzZXIiLCJ2YXJzIjp7InVzZXJuYW1lIjoibWF0dCIsInBhc3N3b3JkIjoicGFzc3dvcmQiLCJyb2xlIjoiYWRtaW5pc3RyYXRvciIsImRpc3BsYXlfbmFtZSI6Ik1hdHQiLCJlbWFpbCI6IiIsImxvZ2luIjp0cnVlfX0seyJzdGVwIjoic2hvd0FkbWluTm90aWNlIiwidmFycyI6eyJ0ZXh0IjoiV2VsY29tZSB0byBXb3JkUHJlc3MgUGxheWdyb3VuZCEiLCJ0eXBlIjoiIiwiZGlzbWlzc2libGUiOnRydWV9fV19)

[Try it now from scratch](https://akirk.github.io/playground-step-library/) or [with a preloaded example](https://akirk.github.io/playground-step-library/#eyJzdGVwcyI6W3sic3RlcCI6ImNyZWF0ZVVzZXIiLCJ2YXJzIjp7InVzZXJuYW1lIjoibWF0dCIsInBhc3N3b3JkIjoicGFzc3dvcmQiLCJyb2xlIjoiYWRtaW5pc3RyYXRvciIsImRpc3BsYXlfbmFtZSI6Ik1hdHQiLCJlbWFpbCI6IiIsImxvZ2luIjp0cnVlfX0seyJzdGVwIjoic2hvd0FkbWluTm90aWNlIiwidmFycyI6eyJ0ZXh0IjoiV2VsY29tZSB0byBXb3JkUHJlc3MgUGxheWdyb3VuZCEiLCJ0eXBlIjoiIiwiZGlzbWlzc2libGUiOnRydWV9fV19).

## Contributing

We welcome contributions to the WordPress Playground Step Library! Here's how you can get involved:

### Setting Up Your Development Environment

1. **Clone the repository:**
   ```bash
   git clone git@github.com:akirk/playground-step-library.git
   cd playground-step-library
   ```

2. **Install dependencies and run locally:**
   ```bash
   npm install
   npm run server
   ```
   The server will start on `http://localhost:8127`

### Creating a New Step

1. **Generate a new step template:**
   ```bash
   node bin/new-step.js yourStepName
   ```

2. **Edit your step files:**
   The script will create `steps/yourStepName.ts` and automatically open it in your editor. It also creates a type definition and updates the registry. [See below how to create your step](#implementation-of-a-step).

3. **Test your changes:**
   ```bash
   npm run build
   npm run serve
   ```
   Then open the Step Library UI at `http://localhost:8127` to verify your new step appears and works correctly.

### Testing

Before submitting your contribution:

- Test your step in the Step Library UI
- Verify it generates the expected blueprint
- Test the generated blueprint in WordPress Playground
- Add unit tests: Create a spec file (e.g., `steps/yourStepName.spec.js`) with unit tests for your step
- Verify the tests are passing: `npm run test`

### Submitting Your Contribution

1. **Fork the repository** on GitHub
2. **Create a feature branch:** `git checkout -b feature/your-step-name`
3. **Commit your changes:** `git commit -m "Add yourStepName step"`
4. **Push to your fork:** `git push origin feature/your-step-name`
5. **[Submit a Pull Request](https://github.com/akirk/playground-step-library/compare)**


### Implementation of a Step

Here is an example of how to implement a step. We'll create a step that will output a custom message to the PHP error log. We'll call it `helloWorldLogger`. You can pass the text that it should log.

Running `node bin/new-step.js helloWorldLogger` will generate the template files:

**`steps/helloWorldLogger.ts`:**
```typescript
import type { StepFunction, HelloWorldLoggerStep } from './types.js';

export const helloWorldLogger: StepFunction<HelloWorldLoggerStep> = (step: HelloWorldLoggerStep) => {
	return [
		{
			"step": "runPHP",
			"code": `<?php require_once '/wordpress/wp-load.php'; error_log( '${step.text}' ); ?>` // We added the php code in this line.
		
		}
	];
};

helloWorldLogger.description = "Log text to the PHP error log";
helloWorldLogger.vars = Object.entries({
	text: { // And then we added these fields to describe it.
		description: "Text to be logged",
		type: "text",
		required: true,
		samples: ["Hello World", "Oh no!!"]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));
```

**Type definition (automatically added to `steps/types.ts`):**
```typescript
export interface HelloWorldLoggerStep extends BlueprintStep {
	text: string; // and also added this variable to our step.
}
```

The step will automatically appear in the [Step Library UI](https://akirk.github.io/playground-step-library/) after running `npm run build`.

#### Transformation

Now, you can use a step like this (which is incompatible with WordPress Playground [because this step is not provided](https://wordpress.github.io/wordpress-playground/blueprints/steps/)):
```json
{
  "step": "helloWorldLogger",
  "text": "Hello from WordPress Playground Step Library!"
}
```

which will then be transformed to:
```json
{
  "step": "runPHP",
  "code": "<?php require_once '/wordpress/wp-load.php'; error_log( 'Hello from WordPress Playground Step Library!' ); ?>"
}
```

which does what you asked for and only uses native WordPress Playground steps.

## Using as NPM Package

The npm package provides a compiler to transform WordPress Playground blueprints with custom steps into blueprints with native steps. It's available as an [npm package](https://www.npmjs.com/package/playground-step-library).

### Installation

```bash
npm install playground-step-library
```

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

### How It Works

This compiler takes WordPress Playground blueprints that use custom steps (like `setSiteName`, `addPage`, etc.) and transforms them into blueprints that only use native WordPress Playground steps (like `runPHP`, `setSiteOptions`, etc.).

#### Input Example

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

#### Output Example

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

### API Reference

#### `PlaygroundStepLibrary`

##### Constructor

```javascript
new PlaygroundStepLibrary()
```

No parameters required - all steps are statically imported.

##### Methods

###### `compile(blueprint, options?)`
Compiles a blueprint with custom steps into a blueprint with native steps.

- `blueprint` (Object|string): Blueprint object or JSON string
- `options` (Object, optional): Compilation options
  - `options.landingPage` (string): Default landing page path
  - `options.features` (Object): Feature configuration
- Returns: Compiled blueprint object
- Throws: Error if compilation fails

###### `validateBlueprint(blueprint)`
Validates a blueprint structure and required variables.

- `blueprint` (Object|string): Blueprint object or JSON string  
- Returns: `{valid: boolean, error?: string}`

###### `getAvailableSteps()`
Returns information about all available custom steps.

- Returns: Object with step names as keys and step info as values
## Custom Steps

This library provides **48** total steps (8 built-in enhanced steps + 40 custom steps):

### Built-in Enhanced Steps
- [`defineWpConfigConst`](docs/steps/defineWpConfigConst.md) - Define a wp-config PHP constant.
- [`enableMultisite`](docs/steps/enableMultisite.md) - Enable WordPress Multisite functionality.
- [`importWxr`](docs/steps/importWxr.md) - Import a WXR from a URL.
- [`installPlugin`](docs/steps/installPlugin.md) - Install a plugin via WordPress.org or Github (branches, releases, PRs).
- [`installTheme`](docs/steps/installTheme.md) - Install a theme via WordPress.org or Github.
- [`login`](docs/steps/login.md) - Login to the site.
- [`runPHP`](docs/steps/runPHP.md) - Run code in the context of WordPress.
- [`setSiteOption`](docs/steps/setSiteOption.md) - Set a site option.

### Custom Steps
- [`addClientRole`](docs/steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- [`addCorsProxy`](docs/steps/addCorsProxy.md) - Automatically add the CORS proxy to outgoing HTTP requests.
- [`addFilter`](docs/steps/addFilter.md) - Easily add a filtered value.
- [`addMedia`](docs/steps/addMedia.md) - Add files to the media library.
- [`addPage`](docs/steps/addPage.md) - Add a page with title and content.
- [`addPost`](docs/steps/addPost.md) - Add a post with title, content, type, status, and date.
- [`addProduct`](docs/steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- [`blockExamples`](docs/steps/blockExamples.md) - Creates a post with all block examples from registered blocks
- [`blueprintExtractor`](docs/steps/blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- [`blueprintRecorder`](docs/steps/blueprintRecorder.md) - Record steps made and compile a new blueprint.
- [`changeAdminColorScheme`](docs/steps/changeAdminColorScheme.md) - Useful to combine with a login step.
- [`createUser`](docs/steps/createUser.md) - Create a new user.
- [`customPostType`](docs/steps/customPostType.md) - Register a custom post type.
- [`debug`](docs/steps/debug.md) - Configure WordPress debug settings and optionally install Query Monitor plugin.
- [`deleteAllPosts`](docs/steps/deleteAllPosts.md) - Delete all posts, pages, attachments, revisions and menu items.
- [`disableWelcomeGuides`](docs/steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- [`doAction`](docs/steps/doAction.md) - Execute a custom action.
- [`fakeHttpResponse`](docs/steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- [`generateProducts`](docs/steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- [`githubImportExportWxr`](docs/steps/githubImportExportWxr.md) - Provide useful additional info.
- [`githubPlugin`](docs/steps/githubPlugin.md) - Install a plugin from a Github repository.
- [`githubPluginRelease`](docs/steps/githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- [`githubTheme`](docs/steps/githubTheme.md) - Install a theme from a Github repository.
- [`importFriendFeeds`](docs/steps/importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- [`importWordPressComExport`](docs/steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- [`installAdminer`](docs/steps/installAdminer.md) - Install Adminer with auto login link.
- [`installPhEditor`](docs/steps/installPhEditor.md) - Install phEditor. Password: admin
- [`installPhpLiteAdmin`](docs/steps/installPhpLiteAdmin.md) - Provide phpLiteAdmin. Password: admin
- [`jetpackOfflineMode`](docs/steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.
- [`muPlugin`](docs/steps/muPlugin.md) - Add code for a plugin.
- [`removeDashboardWidgets`](docs/steps/removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- [`renameDefaultCategory`](docs/steps/renameDefaultCategory.md) - Change the default "Uncategorized".
- [`runWpCliCommand`](docs/steps/runWpCliCommand.md) - Run a wp-cli command.
- [`sampleContent`](docs/steps/sampleContent.md) - Inserts sample pages to the site.
- [`setLandingPage`](docs/steps/setLandingPage.md) - Set the landing page.
- [`setLanguage`](docs/steps/setLanguage.md) - Set the WordPress site language.
- [`setSiteName`](docs/steps/setSiteName.md) - Set the site name and tagline.
- [`setTT4Homepage`](docs/steps/setTT4Homepage.md) - Set the homepage for the twentytwentyfour theme.
- [`showAdminNotice`](docs/steps/showAdminNotice.md) - Show an admin notice in the dashboard.
- [`skipWooCommerceWizard`](docs/steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.