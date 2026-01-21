# WordPress Playground Steps Documentation

This document provides comprehensive documentation for all available WordPress Playground custom steps.

## 📊 Overview

- **Total Steps**: 72
- **Built-in Steps**: 8
- **Custom Steps**: 64

## 🚀 Quick Start

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
    {
      step: 'setSiteName',
      vars: {
        sitename: 'My WordPress Site',
        tagline: 'Powered by Playground'
      }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

## 📚 Step Categories

### Built-in Steps
Built-in steps are core WordPress Playground steps that are enhanced with additional functionality.

- [`importWxr`](steps/importWxr.md) - Import a WXR from a URL.
- [`installPlugin`](steps/installPlugin.md) - Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`installTheme`](steps/installTheme.md) - Install a theme via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`runPHP`](steps/runPHP.md) - Run code in the context of WordPress.
- [`enableMultisite`](steps/enableMultisite.md) - Enable WordPress Multisite functionality.
- [`login`](steps/login.md) - Login to the site.
- [`setSiteOption`](steps/setSiteOption.md) - Set a site option.
- [`defineWpConfigConst`](steps/defineWpConfigConst.md) - Define a wp-config PHP constant.

### Custom Steps  
Custom steps provide additional functionality beyond the core WordPress Playground capabilities.

- [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- [`addMedia`](steps/addMedia.md) - Add files to the media library.
- [`addPage`](steps/addPage.md) - Add a page with title and content.
- [`addPost`](steps/addPost.md) - Add a post with title, content, type, status, and date.
- [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- [`addTemplate`](steps/addTemplate.md) - Add a template (home, single, page, etc.) for a block theme.
- [`addTemplatePart`](steps/addTemplatePart.md) - Add a template part (header, footer, etc.) for a block theme.
- [`blockExamples`](steps/blockExamples.md) - Creates a post with all block examples from registered blocks
- [`blueprintExtractor`](steps/blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- [`blueprintRecorder`](steps/blueprintRecorder.md) - Record steps made and compile a new blueprint.
- [`changeAdminColorScheme`](steps/changeAdminColorScheme.md) - Useful to combine with a login step.
- [`createUser`](steps/createUser.md) - Create a new user.
- [`customPostType`](steps/customPostType.md) - Register a custom post type.
- [`debug`](steps/debug.md) - Configure WordPress debug settings and optionally install Query Monitor plugin.
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
- [`gitPlugin`](steps/gitPlugin.md) - Install a plugin from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`gitTheme`](steps/gitTheme.md) - Install a theme from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`generateProducts`](steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
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
- [`enableIntl`](steps/enableIntl.md) - Enable PHP Intl extension support.
- [`activatePlugin`](steps/activatePlugin.md) - Path to the plugin directory as absolute path.
- [`activateTheme`](steps/activateTheme.md) - The name of the theme folder inside wp-content/themes/.
- [`cp`](steps/cp.md) - Source path.
- [`defineSiteUrl`](steps/defineSiteUrl.md) - Changes the site URL of the WordPress installation.
- [`importThemeStarterContent`](steps/importThemeStarterContent.md) - The step identifier.
- [`importWordPressFiles`](steps/importWordPressFiles.md) - The zip file containing the top-level WordPress files and.
- [`mkdir`](steps/mkdir.md) - The path of the directory you want to create.
- [`mv`](steps/mv.md) - Source path.
- [`request`](steps/request.md) - Request details (See.
- [`resetData`](steps/resetData.md) - Deletes WordPress posts and comments and sets the auto increment sequence.
- [`rm`](steps/rm.md) - The path to remove.
- [`rmdir`](steps/rmdir.md) - The path to remove.
- [`runSql`](steps/runSql.md) - The step identifier.
- [`runWpInstallationWizard`](steps/runWpInstallationWizard.md) - Installs WordPress.
- [`unzip`](steps/unzip.md) - The zip file to extract.
- [`writeFile`](steps/writeFile.md) - The path of the file to write to.
- [`writeFiles`](steps/writeFiles.md) - The path of the file to write to.

## 🔗 Cross-References

Many steps can reference and use other steps. For example:
- `addProduct` automatically calls `installPlugin` to install WooCommerce
- `importFriendFeeds` calls `installPlugin` to install the Friends plugin

## 📖 Detailed Documentation

- [Complete Steps Reference](steps-reference.md) - Detailed list with all parameters
- [Individual Step Documentation](steps/) - Comprehensive docs for each step
- [Built-in Step Usage](builtin-step-usage.md) - See which steps compile to each built-in step

## 🛠️ Contributing

See our [Contributing Guide](../CONTRIBUTING.md) for details on:

- Setting up your development environment
- Creating new steps
- Testing your changes
- Submitting pull requests
