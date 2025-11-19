# Built-in Step Usage Reference

This page shows which custom steps compile to each built-in WordPress Playground step.

## Step Types

- 🔧 **Built-in Step** - Core WordPress Playground steps enhanced with additional functionality
- ⚡ **Custom Step** - New steps that extend Playground beyond its core capabilities

## Table of Contents

- [`defineWpConfigConsts`](#definewpconfigconsts)
- [`enableMultisite`](#enablemultisite)
- [`importWxr`](#importwxr)
- [`installPlugin`](#installplugin)
- [`installTheme`](#installtheme)
- [`login`](#login)
- [`mkdir`](#mkdir)
- [`runPHP`](#runphp)
- [`setSiteLanguage`](#setsitelanguage)
- [`setSiteOptions`](#setsiteoptions)
- [`unzip`](#unzip)
- [`updateUserMeta`](#updateusermeta)
- [`wp-cli`](#wp-cli)
- [`writeFile`](#writefile)

---

## `defineWpConfigConsts`

**Used by 3 steps:**

- ⚡ [`debug`](steps/debug.md) - Configure WordPress debug settings and optionally install Query Monitor plugin.
- 🔧 [`defineWpConfigConst`](steps/defineWpConfigConst.md) - Define a wp-config PHP constant.
- ⚡ [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.

---

## `enableMultisite`

**Used by 1 step:**

- 🔧 [`enableMultisite`](steps/enableMultisite.md) - Enable WordPress Multisite functionality.

---

## `importWxr`

**Used by 1 step:**

- ⚡ [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)

---

## `installPlugin`

**Used by 9 steps:**

- ⚡ [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- ⚡ [`blueprintExtractor`](steps/blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- ⚡ [`blueprintRecorder`](steps/blueprintRecorder.md) - Record steps made and compile a new blueprint.
- ⚡ [`githubPlugin`](steps/githubPlugin.md) - Install a plugin from a Github repository.
- ⚡ [`githubPluginRelease`](steps/githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- ⚡ [`importFriendFeeds`](steps/importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- 🔧 [`installPlugin`](steps/installPlugin.md) - Install a plugin via WordPress.org or Github (branches, releases, PRs).
- ⚡ [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `installTheme`

**Used by 2 steps:**

- ⚡ [`githubTheme`](steps/githubTheme.md) - Install a theme from a Github repository.
- 🔧 [`installTheme`](steps/installTheme.md) - Install a theme via WordPress.org or Github.

---

## `login`

**Used by 2 steps:**

- ⚡ [`createUser`](steps/createUser.md) - Create a new user.
- 🔧 [`login`](steps/login.md) - Login to the site.

---

## `mkdir`

**Used by 14 steps:**

- ⚡ [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- ⚡ [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`customPostType`](steps/customPostType.md) - Register a custom post type.
- ⚡ [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- ⚡ [`fakeHttpResponse`](steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- ⚡ [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- ⚡ [`installAdminer`](steps/installAdminer.md) - Install Adminer with auto login link.
- ⚡ [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin
- ⚡ [`installPhpLiteAdmin`](steps/installPhpLiteAdmin.md) - Provide phpLiteAdmin. Password: admin
- ⚡ [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.
- ⚡ [`removeDashboardWidgets`](steps/removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- ⚡ [`showAdminNotice`](steps/showAdminNotice.md) - Show an admin notice in the dashboard.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `runPHP`

**Used by 13 steps:**

- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`addPage`](steps/addPage.md) - Add a page with title and content.
- ⚡ [`addPost`](steps/addPost.md) - Add a post with title, content, type, status, and date.
- ⚡ [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- ⚡ [`blockExamples`](steps/blockExamples.md) - Creates a post with all block examples from registered blocks
- ⚡ [`createUser`](steps/createUser.md) - Create a new user.
- ⚡ [`deleteAllPosts`](steps/deleteAllPosts.md) - Delete all posts, pages, attachments, revisions and menu items.
- ⚡ [`importFriendFeeds`](steps/importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- ⚡ [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- 🔧 [`runPHP`](steps/runPHP.md) - Run code in the context of WordPress.
- ⚡ [`sampleContent`](steps/sampleContent.md) - Inserts sample pages to the site.
- ⚡ [`setTT4Homepage`](steps/setTT4Homepage.md) - Set the homepage for the twentytwentyfour theme.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `setSiteLanguage`

**Used by 1 step:**

- ⚡ [`setLanguage`](steps/setLanguage.md) - Set the WordPress site language.

---

## `setSiteOptions`

**Used by 2 steps:**

- ⚡ [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.
- ⚡ [`setSiteName`](steps/setSiteName.md) - Set the site name and tagline.

---

## `unzip`

**Used by 2 steps:**

- ⚡ [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- ⚡ [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin

---

## `updateUserMeta`

**Used by 1 step:**

- ⚡ [`changeAdminColorScheme`](steps/changeAdminColorScheme.md) - Useful to combine with a login step.

---

## `wp-cli`

**Used by 1 step:**

- ⚡ [`runWpCliCommand`](steps/runWpCliCommand.md) - Run a wp-cli command.

---

## `writeFile`

**Used by 13 steps:**

- ⚡ [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- ⚡ [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`customPostType`](steps/customPostType.md) - Register a custom post type.
- ⚡ [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- ⚡ [`fakeHttpResponse`](steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- ⚡ [`installAdminer`](steps/installAdminer.md) - Install Adminer with auto login link.
- ⚡ [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin
- ⚡ [`installPhpLiteAdmin`](steps/installPhpLiteAdmin.md) - Provide phpLiteAdmin. Password: admin
- ⚡ [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.
- ⚡ [`removeDashboardWidgets`](steps/removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- ⚡ [`showAdminNotice`](steps/showAdminNotice.md) - Show an admin notice in the dashboard.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

