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

## Sharing & Import/Export

To make it easy to share what you are building, the URL of the page is updated with the blueprint. You can copy the URL and share it with others.

You can also share the Playground URL which contains the final blueprint.

**Import blueprints:**
- **Drag & drop** any `.json` blueprint file to import it
- **Paste Playground URLs** - Both [hash format](https://wordpress.github.io/wordpress-playground/blueprints/data-format) and [Query API](https://wordpress.github.io/wordpress-playground/developers/apis/query-api) URLs
- Native Playground blueprints are automatically decompiled into custom steps

See [Blueprint Import](docs/ui-components.md#blueprint-import) for details.

## Screenshot
[![step-library](https://github.com/akirk/playground-step-library/assets/203408/c536785b-2c6b-44bd-b1cd-4f1b72c074d1)](https://akirk.github.io/playground-step-library/#eyJzdGVwcyI6W3sic3RlcCI6ImNyZWF0ZVVzZXIiLCJ2YXJzIjp7InVzZXJuYW1lIjoibWF0dCIsInBhc3N3b3JkIjoicGFzc3dvcmQiLCJyb2xlIjoiYWRtaW5pc3RyYXRvciIsImRpc3BsYXlfbmFtZSI6Ik1hdHQiLCJlbWFpbCI6IiIsImxvZ2luIjp0cnVlfX0seyJzdGVwIjoic2hvd0FkbWluTm90aWNlIiwidmFycyI6eyJ0ZXh0IjoiV2VsY29tZSB0byBXb3JkUHJlc3MgUGxheWdyb3VuZCEiLCJ0eXBlIjoiIiwiZGlzbWlzc2libGUiOnRydWV9fV19)

[Try it now from scratch](https://akirk.github.io/playground-step-library/) or [with a preloaded example](https://akirk.github.io/playground-step-library/#eyJzdGVwcyI6W3sic3RlcCI6ImNyZWF0ZVVzZXIiLCJ2YXJzIjp7InVzZXJuYW1lIjoibWF0dCIsInBhc3N3b3JkIjoicGFzc3dvcmQiLCJyb2xlIjoiYWRtaW5pc3RyYXRvciIsImRpc3BsYXlfbmFtZSI6Ik1hdHQiLCJlbWFpbCI6IiIsImxvZ2luIjp0cnVlfX0seyJzdGVwIjoic2hvd0FkbWluTm90aWNlIiwidmFycyI6eyJ0ZXh0IjoiV2VsY29tZSB0byBXb3JkUHJlc3MgUGxheWdyb3VuZCEiLCJ0eXBlIjoiIiwiZGlzbWlzc2libGUiOnRydWV9fV19).

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Creating new steps
- Testing your changes
- Submitting pull requests

## Using as NPM Package

The npm package provides a compiler to transform WordPress Playground blueprints with custom steps into blueprints with native steps. It's available as an [npm package](https://www.npmjs.com/package/playground-step-library).

```bash
npm install playground-step-library
```

```javascript
import PlaygroundStepLibrary from 'playground-step-library';

const compiler = new PlaygroundStepLibrary();

const blueprint = {
    steps: [
        { step: 'setSiteName', vars: { sitename: 'My Site', tagline: 'A WordPress site' } }
    ]
};

const v1 = compiler.compile(blueprint);    // V1: imperative, with steps array
const v2 = compiler.compileV2(blueprint);  // V2: declarative, with schema properties

// Transpile native V1 blueprints to V2 (limited support - see docs)
const result = compiler.transpile(nativeV1Blueprint);
```

See the **[Programmatic API Documentation](docs/api.md)** for full details on CLI usage, methods, and examples.
## Custom Steps

This library provides **55** total steps (8 built-in enhanced steps + 47 custom steps):

### Built-in Enhanced Steps
- [`defineWpConfigConst`](docs/steps/defineWpConfigConst.md) - Define a wp-config PHP constant.
- [`enableMultisite`](docs/steps/enableMultisite.md) - Enable WordPress Multisite functionality.
- [`importWxr`](docs/steps/importWxr.md) - Import a WXR from a URL.
- [`installPlugin`](docs/steps/installPlugin.md) - Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`installTheme`](docs/steps/installTheme.md) - Install a theme via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`login`](docs/steps/login.md) - Login to the site.
- [`runPHP`](docs/steps/runPHP.md) - Run code in the context of WordPress.
- [`setSiteOption`](docs/steps/setSiteOption.md) - Set a site option.

### Custom Steps
- [`addClientRole`](docs/steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- [`addFilter`](docs/steps/addFilter.md) - Easily add a filtered value.
- [`addMedia`](docs/steps/addMedia.md) - Add files to the media library.
- [`addPage`](docs/steps/addPage.md) - Add a page with title and content.
- [`addPost`](docs/steps/addPost.md) - Add a post with title, content, type, status, and date.
- [`addProduct`](docs/steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- [`addTemplate`](docs/steps/addTemplate.md) - Add a template (home, single, page, etc.) for a block theme.
- [`addTemplatePart`](docs/steps/addTemplatePart.md) - Add a template part (header, footer, etc.) for a block theme.
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
- [`dontLogin`](docs/steps/dontLogin.md) - Prevent automatic login (Playground logs in as admin by default).
- [`enableIntl`](docs/steps/enableIntl.md) - Enable PHP Intl extension support.
- [`enqueueCss`](docs/steps/enqueueCss.md) - Enqueue custom CSS on frontend and/or admin.
- [`enqueueJs`](docs/steps/enqueueJs.md) - Enqueue custom JavaScript on frontend and/or admin.
- [`fakeHttpResponse`](docs/steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- [`generateProducts`](docs/steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- [`githubImportExportWxr`](docs/steps/githubImportExportWxr.md) - Provide useful additional info.
- [`githubPlugin`](docs/steps/githubPlugin.md) - Install a plugin from a Github repository.
- [`githubPluginRelease`](docs/steps/githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- [`githubTheme`](docs/steps/githubTheme.md) - Install a theme from a Github repository.
- [`gitPlugin`](docs/steps/gitPlugin.md) - Install a plugin from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`gitTheme`](docs/steps/gitTheme.md) - Install a theme from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
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