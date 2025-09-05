# WordPress Playground Step Library

In this Github repository we collect custom [blueprint steps](https://wordpress.github.io/wordpress-playground/blueprints-api/steps/) for [WordPress Playground](https://wordpress.github.io/wordpress-playground/).

## Web UI

You can then use those custom steps [in our Step Builder](https://akirk.github.io/playground-step-library/) to create more complex WordPress Playground setups more easily.

## NPM Package

You can also use the steps in your own projects by using the [npm package](README-npm.md).

## 📚 Documentation

Comprehensive documentation for all steps is available:

- **[📖 Step Documentation](docs/)** - Complete documentation with examples
- **[📋 Steps Reference](docs/steps-reference.md)** - All steps in one page  
- **[🔍 Individual Steps](docs/steps/)** - Detailed docs for each step

## What does it mean?

You can tell WordPress Playground what to do before it loads using a [Blueprint JSON](https://wordpress.github.io/wordpress-playground/blueprints-api/index/) file. There are [a number of builtin steps provided](https://wordpress.github.io/wordpress-playground/blueprints-api/steps/) that in combination can make it do powerful things.

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
   The script will create `steps/yourStepName.ts` and automatically open it in your editor. It also creates a type definition and updates the registry.

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
