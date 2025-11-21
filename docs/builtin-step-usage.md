# Built-in Step Usage Reference

This page shows which custom steps compile to each built-in WordPress Playground step.

## Step Types

- 🔧 **Built-in Step** - Core WordPress Playground steps enhanced with additional functionality
- ⚡ **Custom Step** - New steps that extend Playground beyond its core capabilities

## Table of Contents

- [`activatePlugin`](#activateplugin)
- [`activateTheme`](#activatetheme)
- [`cp`](#cp)
- [`defineWpConfigConsts`](#definewpconfigconsts)
- [`enableMultisite`](#enablemultisite)
- [`installPlugin`](#installplugin)
- [`installTheme`](#installtheme)
- [`login`](#login)
- [`mkdir`](#mkdir)
- [`mv`](#mv)
- [`rm`](#rm)
- [`rmdir`](#rmdir)
- [`runPHP`](#runphp)
- [`runSql`](#runsql)
- [`setSiteLanguage`](#setsitelanguage)
- [`setSiteOptions`](#setsiteoptions)
- [`unzip`](#unzip)
- [`updateUserMeta`](#updateusermeta)
- [`wp-cli`](#wp-cli)
- [`writeFile`](#writefile)

---

## `activatePlugin`

**Used by 1 step:**

- ⚡ [`activatePlugin`](steps/activatePlugin.md) - Activate an already installed plugin.

---

## `activateTheme`

**Used by 1 step:**

- ⚡ [`activateTheme`](steps/activateTheme.md) - Activate an already installed theme.

---

## `cp`

**Used by 1 step:**

- ⚡ [`cp`](steps/cp.md) - Copy a file or directory.

---

## `defineWpConfigConsts`

**Used by 4 steps:**

- ⚡ [`debug`](steps/debug.md) - Configure WordPress debug settings and optionally install Query Monitor plugin.
- 🔧 [`defineWpConfigConst`](steps/defineWpConfigConst.md) - Define a wp-config PHP constant.
- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.

---

## `enableMultisite`

**Used by 1 step:**

- 🔧 [`enableMultisite`](steps/enableMultisite.md) - Enable WordPress Multisite functionality.

---

## `installPlugin`

**Used by 9 steps:**

- ⚡ [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- ⚡ [`blueprintExtractor`](steps/blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- ⚡ [`blueprintRecorder`](steps/blueprintRecorder.md) - Record steps made and compile a new blueprint.
- ⚡ [`generateProducts`](steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`githubPlugin`](steps/githubPlugin.md) - Install a plugin from a Github repository.
- ⚡ [`githubPluginRelease`](steps/githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- 🔧 [`installPlugin`](steps/installPlugin.md) - Install a plugin via WordPress.org or Github (branches, releases, PRs).
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
- ⚡ [`installAdminer`](steps/installAdminer.md) - Install Adminer with auto login link.
- ⚡ [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin
- ⚡ [`installPhpLiteAdmin`](steps/installPhpLiteAdmin.md) - Provide phpLiteAdmin. Password: admin
- ⚡ [`mkdir`](steps/mkdir.md) - Create a directory.
- ⚡ [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.
- ⚡ [`removeDashboardWidgets`](steps/removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- ⚡ [`showAdminNotice`](steps/showAdminNotice.md) - Show an admin notice in the dashboard.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `mv`

**Used by 1 step:**

- ⚡ [`mv`](steps/mv.md) - Move a file or directory.

---

## `rm`

**Used by 1 step:**

- ⚡ [`rm`](steps/rm.md) - Remove a file.

---

## `rmdir`

**Used by 1 step:**

- ⚡ [`rmdir`](steps/rmdir.md) - Remove a directory.

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
- ⚡ [`generateProducts`](steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`importFriendFeeds`](steps/importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- 🔧 [`runPHP`](steps/runPHP.md) - Run code in the context of WordPress.
- ⚡ [`sampleContent`](steps/sampleContent.md) - Inserts sample pages to the site.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `runSql`

**Used by 1 step:**

- ⚡ [`runSQL`](steps/runSQL.md) - Execute SQL queries.

---

## `setSiteLanguage`

**Used by 1 step:**

- ⚡ [`setLanguage`](steps/setLanguage.md) - Set the WordPress site language.

---

## `setSiteOptions`

**Used by 3 steps:**

- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.
- ⚡ [`setSiteName`](steps/setSiteName.md) - Set the site name and tagline.

---

## `unzip`

**Used by 3 steps:**

- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin
- ⚡ [`unzip`](steps/unzip.md) - Extract a zip file.

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

**Used by 15 steps:**

- ⚡ [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- ⚡ [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`customPostType`](steps/customPostType.md) - Register a custom post type.
- ⚡ [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- ⚡ [`fakeHttpResponse`](steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`installAdminer`](steps/installAdminer.md) - Install Adminer with auto login link.
- ⚡ [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin
- ⚡ [`installPhpLiteAdmin`](steps/installPhpLiteAdmin.md) - Provide phpLiteAdmin. Password: admin
- ⚡ [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.
- ⚡ [`removeDashboardWidgets`](steps/removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- ⚡ [`showAdminNotice`](steps/showAdminNotice.md) - Show an admin notice in the dashboard.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.
- ⚡ [`writeFile`](steps/writeFile.md) - Write content to a file.

---

