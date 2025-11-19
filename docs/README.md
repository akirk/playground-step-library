# WordPress Playground Steps Documentation

This document provides comprehensive documentation for all available WordPress Playground custom steps.

## 📊 Overview

- **Total Steps**: 50
- **Built-in Steps**: 8
- **Custom Steps**: 42

## 🚀 Quick Start

### Compile to Blueprint v1 (Imperative)

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
    {
      step: 'setSiteName',
      sitename: 'My WordPress Site',
      tagline: 'Powered by Playground'
    }
  ]
};

const compiled = compiler.compile(blueprint);
// Output: { steps: [...], landingPage: '/', ... }
```

### Compile to Blueprint v2 (Declarative)

```javascript
const { PlaygroundStepLibraryV2 } = require('playground-step-library');
const compiler = new PlaygroundStepLibraryV2();

const blueprint = {
  steps: [
    {
      step: 'setSiteName',
      sitename: 'My WordPress Site',
      tagline: 'Powered by Playground'
    }
  ]
};

const compiled = compiler.compile(blueprint);
// Output: { siteOptions: { blogname: '...', blogdescription: '...' }, ... }
```

## 📚 Step Categories

### Built-in Steps
Built-in steps are core WordPress Playground steps that are enhanced with additional functionality.

- [`defineWpConfigConst`](steps/defineWpConfigConst.md) - Define a wp-config PHP constant.
- [`importWxr`](steps/importWxr.md) - Import a WXR from a URL.
- [`installPlugin`](steps/installPlugin.md) - Install a plugin via WordPress.org or Github (branches, releases, PRs).
- [`installTheme`](steps/installTheme.md) - Install a theme via WordPress.org or Github.
- [`login`](steps/login.md) - Login to the site.
- [`runPHP`](steps/runPHP.md) - Run code in the context of WordPress.
- [`setSiteOption`](steps/setSiteOption.md) - Set a site option.
- [`enableMultisite`](steps/enableMultisite.md) - Enable WordPress Multisite functionality.

### Custom Steps  
Custom steps provide additional functionality beyond the core WordPress Playground capabilities.

- [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- [`addMedia`](steps/addMedia.md) - Add files to the media library.
- [`addPage`](steps/addPage.md) - Add a page with title and content.
- [`addPost`](steps/addPost.md) - Add a post with title, content, type, status, and date.
- [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- [`blueprintExtractor`](steps/blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- [`blueprintRecorder`](steps/blueprintRecorder.md) - Record steps made and compile a new blueprint.
- [`changeAdminColorScheme`](steps/changeAdminColorScheme.md) - Useful to combine with a login step.
- [`createUser`](steps/createUser.md) - Create a new user.
- [`customPostType`](steps/customPostType.md) - Register a custom post type.
- [`deleteAllPosts`](steps/deleteAllPosts.md) - Delete all posts, pages, attachments, revisions and menu items.
- [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- [`dontLogin`](steps/dontLogin.md) - Prevent automatic login (Playground logs in as admin by default).
- [`doAction`](steps/doAction.md) - Execute a custom action.
- [`enqueueCss`](steps/enqueueCss.md) - Enqueue custom CSS on frontend and/or admin.
- [`enqueueJs`](steps/enqueueJs.md) - Enqueue custom JavaScript on frontend and/or admin.
- [`fakeHttpResponse`](steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- [`githubPlugin`](steps/githubPlugin.md) - Install a plugin from a Github repository.
- [`githubPluginRelease`](steps/githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- [`githubTheme`](steps/githubTheme.md) - Install a theme from a Github repository.
- [`importFriendFeeds`](steps/importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- [`installAdminer`](steps/installAdminer.md) - Install Adminer with auto login link.
- [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin
- [`installPhpLiteAdmin`](steps/installPhpLiteAdmin.md) - Provide phpLiteAdmin. Password: admin
- [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.
- [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.
- [`removeDashboardWidgets`](steps/removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- [`renameDefaultCategory`](steps/renameDefaultCategory.md) - Change the default "Uncategorized".
- [`runWpCliCommand`](steps/runWpCliCommand.md) - Run a wp-cli command.
- [`sampleContent`](steps/sampleContent.md) - Inserts sample pages to the site.
- [`setLandingPage`](steps/setLandingPage.md) - Set the landing page.
- [`setLanguage`](steps/setLanguage.md) - Set the WordPress site language.
- [`setSiteName`](steps/setSiteName.md) - Set the site name and tagline.
- [`setTT4Homepage`](steps/setTT4Homepage.md) - Set the homepage for the twentytwentyfour theme.
- [`showAdminNotice`](steps/showAdminNotice.md) - Show an admin notice in the dashboard.
- [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.
- [`generateProducts`](steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- [`blockExamples`](steps/blockExamples.md) - Creates a post with all block examples from registered blocks
- [`debug`](steps/debug.md) - Configure WordPress debug settings and optionally install Query Monitor plugin.

## 🏗️ Architecture

The Step Library supports dual compilation modes:

- **V1 Compiler** (`PlaygroundStepLibrary`) - Outputs imperative blueprints with `steps` array
- **V2 Compiler** (`PlaygroundStepLibraryV2`) - Outputs declarative blueprints with schema properties

Steps implement both modes via the `StepResult` pattern:
- `toV1()` - Returns array of native Playground steps
- `toV2()` - Returns declarative schema fragments (content, users, plugins, etc.)

See [Architecture Documentation](architecture.md) for full details.

## 📖 Detailed Documentation

- [Architecture](architecture.md) - How the compilers work, StepResult pattern, design patterns
- [Complete Steps Reference](steps-reference.md) - Detailed list with all parameters
- [Individual Step Documentation](steps/) - Comprehensive docs for each step
- [Built-in Step Usage](builtin-step-usage.md) - See which steps compile to each built-in step

## 🛠️ Contributing

See our [Contributing Guide](../CONTRIBUTING.md) for details on:

- Setting up your development environment
- Creating new steps
- Testing your changes
- Submitting pull requests
