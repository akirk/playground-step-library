# WordPress Playground Steps Documentation

This document provides comprehensive documentation for all available WordPress Playground custom steps.

## 📊 Overview

- **Total Steps**: 44
- **Built-in Steps**: 8
- **Custom Steps**: 36

## 🚀 Quick Start

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
```

## 📚 Step Categories

### Built-in Steps
Built-in steps are core WordPress Playground steps that are enhanced with additional functionality.

- [`defineWpConfigConst`](steps/defineWpConfigConst.md) - Define a wp-config PHP constant.
- [`importWxr`](steps/importWxr.md) - Import a WXR from a URL.
- [`installPlugin`](steps/installPlugin.md) - Install a plugin via WordPress.org or Github
- [`installTheme`](steps/installTheme.md) - Install a theme
- [`login`](steps/login.md) - Login to the site
- [`runPHP`](steps/runPHP.md) - Run code in the context of WordPress.
- [`setSiteOption`](steps/setSiteOption.md) - Set a site option.
- [`enableMultisite`](steps/enableMultisite.md) - Enable WordPress Multisite functionality.

### Custom Steps  
Custom steps provide additional functionality beyond the core WordPress Playground capabilities.

- [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- [`addCorsProxy`](steps/addCorsProxy.md) - Automatically add the CORS proxy to outgoing HTTP requests.
- [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- [`addMedia`](steps/addMedia.md) - Add files to the media library.
- [`addPage`](steps/addPage.md) - Add a custom page.
- [`addPost`](steps/addPost.md) - Add a post.
- [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- [`blueprintExtractor`](steps/blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- [`blueprintRecorder`](steps/blueprintRecorder.md) - Record steps made and compile a new blueprint.
- [`changeAdminColorScheme`](steps/changeAdminColorScheme.md) - Useful to combine with a login step.
- [`createUser`](steps/createUser.md) - Create a new user.
- [`customPostType`](steps/customPostType.md) - Register a custom post type.
- [`deleteAllPosts`](steps/deleteAllPosts.md) - Delete all posts, pages, attachments, revisions and menu items.
- [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- [`doAction`](steps/doAction.md) - Execute a custom action.
- [`fakeHttpResponse`](steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- [`githubPlugin`](steps/githubPlugin.md) - Install a plugin from a Github repository.
- [`githubPluginRelease`](steps/githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- [`githubTheme`](steps/githubTheme.md) - Install a theme from a Github repository.
- [`importFriendFeeds`](steps/importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
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

## 🔗 Cross-References

Many steps can reference and use other steps. For example:
- `addProduct` automatically calls `installPlugin` to install WooCommerce
- `importFriendFeeds` calls `installPlugin` to install the Friends plugin

## 📖 Detailed Documentation

- [Complete Steps Reference](steps-reference.md) - Detailed list with all parameters
- [Individual Step Documentation](steps/) - Comprehensive docs for each step

## 🛠️ Contributing

To add a new step:

1. Create `steps/yourStepName.js`
2. Define the step function with proper metadata
3. Run `npm run docs:generate` to update documentation
4. Test your step with `npm test`

---

*This documentation is auto-generated from step definitions. Last updated: 2025-09-05T04:06:09.452Z*
