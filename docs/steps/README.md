# Steps Documentation Index

Browse detailed documentation for each WordPress Playground step.

## 📊 Quick Stats
- **72** total steps
- **8** built-in steps  
- **64** custom steps

## 🔧 Built-in Steps
Enhanced core WordPress Playground steps with additional functionality.

- [`defineWpConfigConst`](./defineWpConfigConst.md) - Define a wp-config PHP constant.
- [`enableMultisite`](./enableMultisite.md) - Enable WordPress Multisite functionality.
- [`importWxr`](./importWxr.md) - Import a WXR from a URL.
- [`installPlugin`](./installPlugin.md) - Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`installTheme`](./installTheme.md) - Install a theme via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`login`](./login.md) - Login to the site.
- [`runPHP`](./runPHP.md) - Run code in the context of WordPress.
- [`setSiteOption`](./setSiteOption.md) - Set a site option.

## ⚡ Custom Steps
Extended functionality beyond core WordPress Playground capabilities.

- [`activatePlugin`](./activatePlugin.md) - Path to the plugin directory as absolute path.
- [`activateTheme`](./activateTheme.md) - The name of the theme folder inside wp-content/themes/.
- [`addClientRole`](./addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- [`addFilter`](./addFilter.md) - Easily add a filtered value.
- [`addMedia`](./addMedia.md) - Add files to the media library.
- [`addPage`](./addPage.md) - Add a page with title and content.
- [`addPost`](./addPost.md) - Add a post with title, content, type, status, and date.
- [`addProduct`](./addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- [`addTemplate`](./addTemplate.md) - Add a template (home, single, page, etc.) for a block theme.
- [`addTemplatePart`](./addTemplatePart.md) - Add a template part (header, footer, etc.) for a block theme.
- [`blockExamples`](./blockExamples.md) - Creates a post with all block examples from registered blocks
- [`blueprintExtractor`](./blueprintExtractor.md) - Generate a new blueprint after modifying the WordPress.
- [`blueprintRecorder`](./blueprintRecorder.md) - Record steps made and compile a new blueprint.
- [`changeAdminColorScheme`](./changeAdminColorScheme.md) - Useful to combine with a login step.
- [`cp`](./cp.md) - Source path.
- [`createUser`](./createUser.md) - Create a new user.
- [`customPostType`](./customPostType.md) - Register a custom post type.
- [`debug`](./debug.md) - Configure WordPress debug settings and optionally install Query Monitor plugin.
- [`defineSiteUrl`](./defineSiteUrl.md) - Changes the site URL of the WordPress installation.
- [`deleteAllPosts`](./deleteAllPosts.md) - Delete all posts, pages, attachments, revisions and menu items.
- [`disableWelcomeGuides`](./disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- [`doAction`](./doAction.md) - Execute a custom action.
- [`dontLogin`](./dontLogin.md) - Prevent automatic login (Playground logs in as admin by default).
- [`enableIntl`](./enableIntl.md) - Enable PHP Intl extension support.
- [`enqueueCss`](./enqueueCss.md) - Enqueue custom CSS on frontend and/or admin.
- [`enqueueJs`](./enqueueJs.md) - Enqueue custom JavaScript on frontend and/or admin.
- [`fakeHttpResponse`](./fakeHttpResponse.md) - Fake a wp_remote_request() response.
- [`generateProducts`](./generateProducts.md) - Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)
- [`githubImportExportWxr`](./githubImportExportWxr.md) - Provide useful additional info.
- [`githubPlugin`](./githubPlugin.md) - Install a plugin from a Github repository.
- [`githubPluginRelease`](./githubPluginRelease.md) - Install a specific plugin release from a Github repository.
- [`githubTheme`](./githubTheme.md) - Install a theme from a Github repository.
- [`gitPlugin`](./gitPlugin.md) - Install a plugin from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`gitTheme`](./gitTheme.md) - Install a theme from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).
- [`importFriendFeeds`](./importFriendFeeds.md) - Add subscriptions to the Friends plugin.
- [`importThemeStarterContent`](./importThemeStarterContent.md) - The step identifier.
- [`importWordPressComExport`](./importWordPressComExport.md) - Import a WordPress.com export file (WXR in a ZIP)
- [`importWordPressFiles`](./importWordPressFiles.md) - The zip file containing the top-level WordPress files and.
- [`installAdminer`](./installAdminer.md) - Install Adminer with auto login link.
- [`installPhEditor`](./installPhEditor.md) - Install phEditor. Password: admin
- [`installPhpLiteAdmin`](./installPhpLiteAdmin.md) - Provide phpLiteAdmin. Password: admin
- [`jetpackOfflineMode`](./jetpackOfflineMode.md) - Start Jetpack in Offline mode.
- [`mkdir`](./mkdir.md) - The path of the directory you want to create.
- [`muPlugin`](./muPlugin.md) - Add code for a plugin.
- [`mv`](./mv.md) - Source path.
- [`removeDashboardWidgets`](./removeDashboardWidgets.md) - Remove widgets from the wp-admin dashboard.
- [`renameDefaultCategory`](./renameDefaultCategory.md) - Change the default "Uncategorized".
- [`request`](./request.md) - Request details (See.
- [`resetData`](./resetData.md) - Deletes WordPress posts and comments and sets the auto increment sequence.
- [`rm`](./rm.md) - The path to remove.
- [`rmdir`](./rmdir.md) - The path to remove.
- [`runSql`](./runSql.md) - The step identifier.
- [`runWpCliCommand`](./runWpCliCommand.md) - Run a wp-cli command.
- [`runWpInstallationWizard`](./runWpInstallationWizard.md) - Installs WordPress.
- [`sampleContent`](./sampleContent.md) - Inserts sample pages to the site.
- [`setLandingPage`](./setLandingPage.md) - Set the landing page.
- [`setLanguage`](./setLanguage.md) - Set the WordPress site language.
- [`setSiteName`](./setSiteName.md) - Set the site name and tagline.
- [`setTT4Homepage`](./setTT4Homepage.md) - Set the homepage for the twentytwentyfour theme.
- [`showAdminNotice`](./showAdminNotice.md) - Show an admin notice in the dashboard.
- [`skipWooCommerceWizard`](./skipWooCommerceWizard.md) - When running WooCommerce, don't show the wizard.
- [`unzip`](./unzip.md) - The zip file to extract.
- [`writeFile`](./writeFile.md) - The path of the file to write to.
- [`writeFiles`](./writeFiles.md) - The path of the file to write to.

## 📖 Other Documentation

- [← Back to Main Documentation](../README.md)
- [Complete Steps Reference](../steps-reference.md) - All steps in one page
- [Built-in Step Usage](../builtin-step-usage.md) - See which steps compile to each built-in step
