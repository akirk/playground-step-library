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

- [`defineWpConfigConst`](steps/defineWpConfigConst.md) - No description available
- [`enableMultisite`](steps/enableMultisite.md) - No description available
- [`importWxr`](steps/importWxr.md) - No description available
- [`installPlugin`](steps/installPlugin.md) - Install a plugin via WordPress.org or Github
- [`installTheme`](steps/installTheme.md) - Install a theme
- [`login`](steps/login.md) - Login to the site
- [`runPHP`](steps/runPHP.md) - No description available
- [`setSiteOption`](steps/setSiteOption.md) - No description available

### Custom Steps  
Custom steps provide additional functionality beyond the core WordPress Playground capabilities.

- [`addClientRole`](steps/addClientRole.md) - No description available
- [`addCorsProxy`](steps/addCorsProxy.md) - No description available
- [`addFilter`](steps/addFilter.md) - No description available
- [`addMedia`](steps/addMedia.md) - No description available
- [`addPage`](steps/addPage.md) - No description available
- [`addPost`](steps/addPost.md) - No description available
- [`addProduct`](steps/addProduct.md) - No description available
- [`blueprintExtractor`](steps/blueprintExtractor.md) - No description available
- [`blueprintRecorder`](steps/blueprintRecorder.md) - No description available
- [`changeAdminColorScheme`](steps/changeAdminColorScheme.md) - No description available
- [`createUser`](steps/createUser.md) - No description available
- [`customPostType`](steps/customPostType.md) - No description available
- [`deleteAllPosts`](steps/deleteAllPosts.md) - No description available
- [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - No description available
- [`doAction`](steps/doAction.md) - No description available
- [`fakeHttpResponse`](steps/fakeHttpResponse.md) - No description available
- [`githubImportExportWxr`](steps/githubImportExportWxr.md) - No description available
- [`githubPlugin`](steps/githubPlugin.md) - No description available
- [`githubPluginRelease`](steps/githubPluginRelease.md) - No description available
- [`githubTheme`](steps/githubTheme.md) - No description available
- [`importFriendFeeds`](steps/importFriendFeeds.md) - No description available
- [`importWordPressComExport`](steps/importWordPressComExport.md) - No description available
- [`installPhEditor`](steps/installPhEditor.md) - No description available
- [`installPhpLiteAdmin`](steps/installPhpLiteAdmin.md) - No description available
- [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - No description available
- [`muPlugin`](steps/muPlugin.md) - No description available
- [`removeDashboardWidgets`](steps/removeDashboardWidgets.md) - No description available
- [`renameDefaultCategory`](steps/renameDefaultCategory.md) - No description available
- [`runWpCliCommand`](steps/runWpCliCommand.md) - No description available
- [`sampleContent`](steps/sampleContent.md) - No description available
- [`setLandingPage`](steps/setLandingPage.md) - No description available
- [`setLanguage`](steps/setLanguage.md) - No description available
- [`setSiteName`](steps/setSiteName.md) - No description available
- [`setTT4Homepage`](steps/setTT4Homepage.md) - No description available
- [`showAdminNotice`](steps/showAdminNotice.md) - No description available
- [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - No description available

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

*This documentation is auto-generated from step definitions. Last updated: 2025-09-04T15:12:26.286Z*
