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
[![step-library](https://github.com/akirk/playground-step-library/assets/203408/c536785b-2c6b-44bd-b1cd-4f1b72c074d1)](https://akirk.github.io/playground-step-library/#createUser__username--matt__password--password__role--administrator&&login__username--matt__password--password&&showAdminNotice__text--Welcome%20to%20WordPress%20Playground!)

[Try it now from scratch](https://akirk.github.io/playground-step-library/) or [with a preloaded example](https://akirk.github.io/playground-step-library/#createUser__username--matt__password--password__role--administrator&&login__username--matt__password--password&&showAdminNotice__text--Welcome%20to%20WordPress%20Playground!).

## Contributing

To run locally, all you need is to have your browser server `index.html`.

You can use `http-server` utility to serve a directory contents on a port (requires installing `npm install -g http-server`). 
Afterward, just run `http-server -p 9999` and navigate to `http://localhost:9999`

You can submit your own steps! Typically, you'll want to clone the repo to a local directory and create a new file in the `steps` directory (see below) to try it before you [submit a PR](https://github.com/akirk/playground-step-library/compare).
```
git clone git@github.com:akirk/playground-step-library.git
cd playground-step-library
touch steps/newStep.js
command $EDITOR steps/newStep.js
```
When you're finished, [create that new file in the steps directory](https://github.com/akirk/playground-step-library/new/main/steps).

Alternatively, you could also [fork this repository](https://github.com/akirk/playground-step-library/fork) and [submit a PR](https://github.com/akirk/playground-step-library/compare) from your fork.

### Implementation of a Step

Here is an example how to implement a step. We'll create a step that will output a custom message to the PHP error log. We'll call it `helloWorldLogger`. You can pass the text that it should log. The step will look like this:

```json
{
	"step": "helloWorldLogger",
	"vars": {
		"text": "Hello World"
	}
}
```
which we then want to transforme to this:
```json
{
	"step": "runPHP",
	"code": "<?php require_once '/wordpress/wp-load.php'; error_log( 'Hello World' ); ?>"
}
```

To achieve this, we add a file `steps/helloWorldLogger.js` with the following content (executing `node bin/newStep.js helloWorldLogger` will give you a template):


```js
customSteps.helloWorldLogger = function( step ) {
	return steps = [
		// List one or multiple steps that achieve what the step is supposed to do
		{
			// This step must be a builtin step:
            "step": "runPHP",
            // Here the variable ${text} is passed in the step as a variable (see above for how it's used and below for how it's defined).
            "code": "<?php require_once '/wordpress/wp-load.php'; error_log( '${text}' ); ?>"
		}
	];
}
// Describe your step.
customSteps.helloWorldLogger.description = "Log text to the PHP error log";
customSteps.helloWorldLogger.vars = [
	{
		// The name will be replaced in any of the strings of the step. So here it'd be ${text} because it says "text".
		"name": "text",
		// This is displayed as a placeholder in the Step Library UI.
		"description": "Text to be logged",
		"required": true,
		// If you provide multiple samples
		"samples": [ "Hello World", "Oh no!!" ]
	}
];
```

Then, we need to include the file in [`index.html`](https://github.com/akirk/playground-step-library/blob/main/index.html#L10). This can either be done manually, or, preferrably, by executing a small script:
```
node bin/update-load-steps.js
```

Finally, the new step will appear as one of the available steps in the [Step Library UI](https://akirk.github.io/playground-step-library/).
