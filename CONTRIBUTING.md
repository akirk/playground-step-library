# Contributing to WordPress Playground Step Library

We welcome contributions to the WordPress Playground Step Library! Here's how you can get involved:

## Setting Up Your Development Environment

1. **Clone the repository:**
   ```bash
   git clone git@github.com:akirk/playground-step-library.git
   cd playground-step-library
   ```

2. **Install dependencies and run locally:**
   ```bash
   npm install
   npm run dev
   ```
   The development server will start with Vite

## Creating a New Step

1. **Generate a new step template:**
   ```bash
   node bin/new-step.js yourStepName
   ```

2. **Edit your step files:**
   The script will create `steps/yourStepName.ts` and automatically open it in your editor. It also creates a type definition and updates the registry. [See below how to create your step](#implementation-of-a-step).

3. **Test your changes:**
   ```bash
   npm run dev
   ```
   Then open the Step Library UI in your browser to verify your new step appears and works correctly.

## Testing

Before submitting your contribution:

- Test your step in the Step Library UI
- Verify it generates the expected blueprint
- Test the generated blueprint in WordPress Playground
- Add unit tests: Create a spec file (e.g., `steps/yourStepName.spec.js`) with unit tests for your step
- Verify the tests are passing: `npm run test`

## Submitting Your Contribution

1. **Fork the repository** on GitHub
2. **Create a feature branch:** `git checkout -b feature/your-step-name`
3. **Commit your changes:** `git commit -m "Add yourStepName step"`
4. **Push to your fork:** `git push origin feature/your-step-name`
5. **[Submit a Pull Request](https://github.com/akirk/playground-step-library/compare)**


## Implementation of a Step

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
helloWorldLogger.vars = [
	{ // And then we added these fields to describe it.
		name: "text",
		description: "Text to be logged",
		type: "text",
		required: true,
		samples: ["Hello World", "Oh no!!"]
	}
];
```

**Type definition (automatically added to `steps/types.ts`):**
```typescript
export interface HelloWorldLoggerStep extends BlueprintStep {
	text: string; // and also added this variable to our step.
}
```

The step will automatically appear in the [Step Library UI](https://akirk.github.io/playground-step-library/) after running `npm run build`.

### Transformation

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
