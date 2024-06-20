# WordPress Playground Step Library

In this Github repository we collect custom [steps](https://wordpress.github.io/wordpress-playground/blueprints-api/index/) for blueprints of [WordPress Playground](https://wordpress.github.io/wordpress-playground/).

[Try it here!](https://akirk.github.io/playground-step-library/)

## What does it mean?

You can tell WordPress Playground what to do before it loads using a Blueprint JSON file. There are [a number of builtin steps provided](https://wordpress.github.io/wordpress-playground/blueprints-api/index/) that in combination can make it do powerful things.

Now, this tool collects custom steps that make it easier to specify more complex tasks. The steps get transformed into builtin steps to form a valid, final blueprint that can be executed by WordPress Playground.

## How does it work?

In the [Step Library UI](https://akirk.github.io/playground-step-library/) you can select the steps you want to use by clicking or dragging. On each step you can modify the variables if any. You can also reorder the steps when necessary.

The final blueprint is immediately updated so that you can click the "Launch in Playground" to see if it achieves what you try to do.

## Sharing

To make it easy to share what you are building, the URL of the page is updated with the blueprint. You can copy the URL and share it with others.

You can also share the Playground URL which contains the final blueprint.

## Screenshot


[Try it now!](https://akirk.github.io/playground-step-library/)

## Contributing

You can submit your own steps! Take a look at the steps directory and submit a PR for a new step.

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
	"code": "<?php require_once 'wordpress/wp-load.php'; error_log( 'Hello World' ); ?>"
}
```

To achieve this, we add a file `steps/helloWorldLogger.js` with the following content:

```js
customSteps.helloWorldLogger = function( step ) {
	return steps = [
		// List one or multiple steps that achieve what the step is supposed to do
		{
			// This step must be a builtin step:
            "step": "runPHP",
            // Here the variable ${text} is passed in the step as a variable (see above for how it's used and below for how it's defined).
            "code": "<?php require_once 'wordpress/wp-load.php'; error_log( '${text}' ); ?>"
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
