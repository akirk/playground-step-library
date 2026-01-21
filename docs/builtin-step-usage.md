# Built-in Step Usage Reference

This page shows which custom steps compile to each built-in WordPress Playground step.

## Step Types

- 🔧 **Built-in Step** - Core WordPress Playground steps enhanced with additional functionality
- ⚡ **Custom Step** - New steps that extend Playground beyond its core capabilities

## Table of Contents

- [`activatePlugin`](#activateplugin)
- [`activateTheme`](#activatetheme)
- [`cp`](#cp)
- [`defineSiteUrl`](#definesiteurl)
- [`defineWpConfigConsts`](#definewpconfigconsts)
- [`enableMultisite`](#enablemultisite)
- [`importThemeStarterContent`](#importthemestartercontent)
- [`importWordPressFiles`](#importwordpressfiles)
- [`importWxr`](#importwxr)
- [`installPlugin`](#installplugin)
- [`installTheme`](#installtheme)
- [`login`](#login)
- [`mkdir`](#mkdir)
- [`mv`](#mv)
- [`request`](#request)
- [`resetData`](#resetdata)
- [`rm`](#rm)
- [`rmdir`](#rmdir)
- [`runPHP`](#runphp)
- [`runSql`](#runsql)
- [`runWpInstallationWizard`](#runwpinstallationwizard)
- [`setSiteLanguage`](#setsitelanguage)
- [`setSiteOptions`](#setsiteoptions)
- [`unzip`](#unzip)
- [`updateUserMeta`](#updateusermeta)
- [`wp-cli`](#wp-cli)
- [`writeFile`](#writefile)
- [`writeFiles`](#writefiles)

---

## `activatePlugin`

**Used by 1 step:**

- ⚡ [`activatePlugin`](steps/activatePlugin.md) - Path to the plugin directory as absolute path.

---

## `activateTheme`

**Used by 1 step:**

- ⚡ [`activateTheme`](steps/activateTheme.md) - The name of the theme folder inside wp-content/themes/.

---

## `cp`

**Used by 1 step:**

- ⚡ [`cp`](steps/cp.md) - Source path.

---

## `defineSiteUrl`

**Used by 1 step:**

- ⚡ [`defineSiteUrl`](steps/defineSiteUrl.md) - Changes the site URL of the WordPress installation.

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

## `importThemeStarterContent`

**Used by 1 step:**

- ⚡ [`importThemeStarterContent`](steps/importThemeStarterContent.md) - The step identifier.

---

## `importWordPressFiles`

**Used by 1 step:**

- ⚡ [`importWordPressFiles`](steps/importWordPressFiles.md) - The zip file containing the top-level WordPress files and.

---

## `importWxr`

**Used by 1 step:**

- ⚡ [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)

---

## `installPlugin`

**Used by 10 steps:**

- ⚡ [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- ⚡ [`blueprintExtractor`](steps/blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- ⚡ [`blueprintRecorder`](steps/blueprintRecorder.md) - Record steps made and compile a new blueprint.
- ⚡ [`generateProducts`](steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`githubPlugin`](steps/githubPlugin.md) - Install a plugin from a Github repository.
- ⚡ [`githubPluginRelease`](steps/githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- ⚡ [`gitPlugin`](steps/gitPlugin.md) - Install a plugin from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- 🔧 [`installPlugin`](steps/installPlugin.md) - Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `installTheme`

**Used by 3 steps:**

- ⚡ [`githubTheme`](steps/githubTheme.md) - Install a theme from a Github repository.
- ⚡ [`gitTheme`](steps/gitTheme.md) - Install a theme from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- 🔧 [`installTheme`](steps/installTheme.md) - Install a theme via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).

---

## `login`

**Used by 2 steps:**

- ⚡ [`createUser`](steps/createUser.md) - Create a new user.
- 🔧 [`login`](steps/login.md) - Login to the site.

---

## `mkdir`

**Used by 15 steps:**

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
- ⚡ [`mkdir`](steps/mkdir.md) - The path of the directory you want to create.
- ⚡ [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.
- ⚡ [`removeDashboardWidgets`](steps/removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- ⚡ [`showAdminNotice`](steps/showAdminNotice.md) - Show an admin notice in the dashboard.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `mv`

**Used by 1 step:**

- ⚡ [`mv`](steps/mv.md) - Source path.

---

## `request`

**Used by 1 step:**

- ⚡ [`request`](steps/request.md) - Request details (See.

---

## `resetData`

**Used by 1 step:**

- ⚡ [`resetData`](steps/resetData.md) - Deletes WordPress posts and comments and sets the auto increment sequence.

---

## `rm`

**Used by 1 step:**

- ⚡ [`rm`](steps/rm.md) - The path to remove.

---

## `rmdir`

**Used by 1 step:**

- ⚡ [`rmdir`](steps/rmdir.md) - The path to remove.

---

## `runPHP`

**Used by 16 steps:**

- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`addPage`](steps/addPage.md) - Add a page with title and content.
- ⚡ [`addPost`](steps/addPost.md) - Add a post with title, content, type, status, and date.
- ⚡ [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- ⚡ [`addTemplate`](steps/addTemplate.md) - Add a template (home, single, page, etc.) for a block theme.
- ⚡ [`addTemplatePart`](steps/addTemplatePart.md) - Add a template part (header, footer, etc.) for a block theme.
- ⚡ [`blockExamples`](steps/blockExamples.md) - Creates a post with all block examples from registered blocks
- ⚡ [`createUser`](steps/createUser.md) - Create a new user.
- ⚡ [`deleteAllPosts`](steps/deleteAllPosts.md) - Delete all posts, pages, attachments, revisions and menu items.
- ⚡ [`generateProducts`](steps/generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`importFriendFeeds`](steps/importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- ⚡ [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- 🔧 [`runPHP`](steps/runPHP.md) - Run code in the context of WordPress.
- ⚡ [`sampleContent`](steps/sampleContent.md) - Inserts sample pages to the site.
- ⚡ [`setTT4Homepage`](steps/setTT4Homepage.md) - Set the homepage for the twentytwentyfour theme.

---

## `runSql`

**Used by 1 step:**

- ⚡ [`runSql`](steps/runSql.md) - The step identifier.

---

## `runWpInstallationWizard`

**Used by 1 step:**

- ⚡ [`runWpInstallationWizard`](steps/runWpInstallationWizard.md) - Installs WordPress.

---

## `setSiteLanguage`

**Used by 1 step:**

- ⚡ [`setLanguage`](steps/setLanguage.md) - Set the WordPress site language.

---

## `setSiteOptions`

**Used by 4 steps:**

- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`jetpackOfflineMode`](steps/jetpackOfflineMode.md) - Start Jetpack in Offline mode.
- ⚡ [`setSiteName`](steps/setSiteName.md) - Set the site name and tagline.
- ⚡ [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.

---

## `unzip`

**Used by 4 steps:**

- ⚡ [`githubImportExportWxr`](steps/githubImportExportWxr.md) - Provide useful additional info.
- ⚡ [`importWordPressComExport`](steps/importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- ⚡ [`installPhEditor`](steps/installPhEditor.md) - Install phEditor. Password: admin
- ⚡ [`unzip`](steps/unzip.md) - The zip file to extract.

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
- ⚡ [`writeFile`](steps/writeFile.md) - The path of the file to write to.

---

## `writeFiles`

**Used by 1 step:**

- ⚡ [`writeFiles`](steps/writeFiles.md) - The path of the file to write to.

---

