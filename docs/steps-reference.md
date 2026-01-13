# Complete Steps Reference

This document provides detailed information about all available steps, including their parameters, types, and usage examples. Click on a step name to view its detailed documentation.

---

## [`addClientRole`](steps/addClientRole.md)

**Type**: Custom Step
**Description**: Adds a role for clients with additional capabilities than editors, but not quite admin.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `displayName` | string | ✅ Yes | Display name for the client role |


### Example Usage

```json
    {
          "step": "addClientRole",
          "vars": {
                "displayName": "Client"
          }
    }
```


---

## [`addFilter`](steps/addFilter.md)

**Type**: Custom Step
**Description**: Easily add a filtered value.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `filter` | string | ✅ Yes | Name of the filter |
| `code` | textarea | ✅ Yes | Code for the filter |
| `priority` | string | ❌ No | Priority of the filter |


### Example Usage

```json
    {
          "step": "addFilter",
          "vars": {
                "filter": "init",
                "code": "'__return_false'",
                "priority": "10"
          }
    }
```


---

## [`addMedia`](steps/addMedia.md)

**Type**: Custom Step
**Description**: Add files to the media library.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `downloadUrl` | string | ✅ Yes | Where to download the media from (can be a zip). |


### Example Usage

```json
    {
          "step": "addMedia",
          "vars": {
                "downloadUrl": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
          }
    }
```


---

## [`addPage`](steps/addPage.md)

**Type**: Custom Step
**Description**: Add a page with title and content.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the page |
| `content` | textarea | ✅ Yes | The HTML content of the page |
| `homepage` | boolean | ❌ No | Set it as the Homepage |


### Example Usage

```json
    {
          "step": "addPage",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>",
                "homepage": false
          }
    }
```


---

## [`addPost`](steps/addPost.md)

**Type**: Custom Step
**Description**: Add a post with title, content, type, status, and date.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the post |
| `content` | textarea | ✅ Yes | The HTML content of the post |
| `date` | string | ❌ No | The date of the post (optional) |
| `type` | string | ❌ No | The post type |
| `status` | string | ❌ No | The post status |
| `postId` | text | ❌ No | Post ID to use (optional) |
| `landingPage` | boolean | ❌ No | Set landing page to the post editor (requires postId) |
| `frontendLandingPage` | boolean | ❌ No | Set landing page to the post on the frontend (requires postId) |
| `registerPostType` | button | ❌ No | Register custom post type if needed |


### Example Usage

```json
    {
          "step": "addPost",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>",
                "date": "now",
                "type": "post",
                "status": "publish",
                "postId": "1000",
                "landingPage": false,
                "frontendLandingPage": false,
                "registerPostType": "example-value"
          }
    }
```


---

## [`addProduct`](steps/addProduct.md)

**Type**: Custom Step
**Description**: Add a WooCommerce product (will install WooCommerce if not present)

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the product |
| `description` | textarea | ✅ Yes | The description of the product |
| `price` | string | ❌ No | Regular price (without currency symbol) |
| `salePrice` | string | ❌ No | Sale price (optional, must be less than regular price) |
| `sku` | string | ❌ No | Product SKU/code (optional) |
| `status` | string | ❌ No | Product status |


### Example Usage

```json
    {
          "step": "addProduct",
          "vars": {
                "title": "Sample Product",
                "description": "<p>This is a great product!</p>",
                "price": "19.99",
                "salePrice": "15.99",
                "sku": "PROD-001",
                "status": "publish"
          }
    }
```


---

## [`addTemplate`](steps/addTemplate.md)

**Type**: Custom Step
**Description**: Add a template (home, single, page, etc.) for a block theme.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `slug` | text | ✅ Yes | The template slug (e.g., "home", "single", "page", "archive") |
| `theme` | text | ❌ No | The theme slug (empty = current active theme) |
| `content` | textarea | ✅ Yes | The block markup content |
| `title` | text | ❌ No | Display title (defaults to slug) |


### Example Usage

```json
    {
          "step": "addTemplate",
          "vars": {
                "slug": "home",
                "theme": "twentytwentyfour",
                "content": "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\",\"area\":\"header\"} /-->\n\n<!-- wp:post-content /-->\n\n<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\",\"area\":\"footer\"} /-->",
                "title": "Home"
          }
    }
```


---

## [`addTemplatePart`](steps/addTemplatePart.md)

**Type**: Custom Step
**Description**: Add a template part (header, footer, etc.) for a block theme.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `slug` | text | ✅ Yes | The template part slug (e.g., "header", "footer", "sidebar") |
| `theme` | text | ❌ No | The theme slug (empty = current active theme) |
| `content` | textarea | ✅ Yes | The block markup content |
| `area` | select | ❌ No | The template part area |
| `title` | text | ❌ No | Display title (defaults to slug) |


### Example Usage

```json
    {
          "step": "addTemplatePart",
          "vars": {
                "slug": "header",
                "theme": "twentytwentyfour",
                "content": "<!-- wp:site-title /-->",
                "area": "header",
                "title": "Header"
          }
    }
```


---

## [`blockExamples`](steps/blockExamples.md)

**Type**: Custom Step
**Description**: Creates a post with all block examples from registered blocks

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `blockNamespace` | text | ❌ No | Limit to a specific plugin slug (leave empty for all plugins) |
| `postTitle` | text | ❌ No | Title of the post to create |
| `limit` | text | ❌ No | Maximum number of blocks to include (leave empty for no limit) |
| `postId` | text | ❌ No | Post ID to use (defaults to 1000) |
| `excludeCore` | boolean | ❌ No | Exclude core WordPress blocks |
| `landingPage` | boolean | ❌ No | Set landing page to the post editor |


### Example Usage

```json
    {
          "step": "blockExamples",
          "vars": {
                "blockNamespace": "gutenberg",
                "postTitle": "Block Examples",
                "limit": "10",
                "postId": "1000",
                "excludeCore": false,
                "landingPage": true
          }
    }
```


---

## [`blueprintExtractor`](steps/blueprintExtractor.md)

**Type**: Custom Step
**Description**: Generate a new blueprint after modifying the WordPress.

*No variables defined.*

### Example Usage

```json
    {
          "step": "blueprintExtractor"
    }
```


---

## [`blueprintRecorder`](steps/blueprintRecorder.md)

**Type**: Custom Step
**Description**: Record steps made and compile a new blueprint.

*No variables defined.*

### Example Usage

```json
    {
          "step": "blueprintRecorder"
    }
```


---

## [`changeAdminColorScheme`](steps/changeAdminColorScheme.md)

**Type**: Custom Step
**Description**: Useful to combine with a login step.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `colorScheme` | string | ✅ Yes | Color scheme |


### Example Usage

```json
    {
          "step": "changeAdminColorScheme",
          "vars": {
                "colorScheme": "modern"
          }
    }
```


---

## [`createUser`](steps/createUser.md)

**Type**: Custom Step
**Description**: Create a new user.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ✅ Yes | Password |
| `role` | text | ✅ Yes | Role |
| `display_name` | string | ❌ No | Display Name |
| `email` | string | ❌ No | E-Mail |
| `login` | boolean | ❌ No | Immediately log the user in |


### Example Usage

```json
    {
          "step": "createUser",
          "vars": {
                "username": "user",
                "password": "password",
                "role": "administrator",
                "display_name": "User",
                "email": "wordpress@example.org",
                "login": true
          }
    }
```


---

## [`customPostType`](steps/customPostType.md)

**Type**: Custom Step
**Description**: Register a custom post type.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `slug` | string | ✅ Yes | Post type key |
| `name` | string | ✅ Yes | The user visible label |
| `supports` | string | ❌ No | Features this post type supports |
| `public` | boolean | ❌ No | Whether the post type is public |


### Example Usage

```json
    {
          "step": "customPostType",
          "vars": {
                "slug": "book",
                "name": "Books",
                "supports": "['title', 'editor']",
                "public": true
          }
    }
```


---

## [`debug`](steps/debug.md)

**Type**: Custom Step
**Description**: Configure WordPress debug settings and optionally install Query Monitor plugin.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `wpDebug` | boolean | ❌ No | Enable WordPress debug mode |
| `wpDebugDisplay` | boolean | ❌ No | Display errors in HTML output. Only applies when the above is enabled. |
| `scriptDebug` | boolean | ❌ No | Use non-minified JavaScript and CSS files. |
| `queryMonitor` | boolean | ❌ No | Install Query Monitor plugin. |


### Example Usage

```json
    {
          "step": "debug",
          "vars": {
                "wpDebug": false,
                "wpDebugDisplay": false,
                "scriptDebug": false,
                "queryMonitor": false
          }
    }
```


---

## [`defineWpConfigConst`](steps/defineWpConfigConst.md)

**Type**: Built-in Step
**Description**: Define a wp-config PHP constant.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ Yes | Constant name |
| `value` | string | ✅ Yes | Constant value |


### Example Usage

```json
    {
          "step": "defineWpConfigConst",
          "vars": {
                "name": "WP_DEBUG",
                "value": "true"
          }
    }
```


---

## [`deleteAllPosts`](steps/deleteAllPosts.md)

**Type**: Custom Step
**Description**: Delete all posts, pages, attachments, revisions and menu items.

*No variables defined.*

### Example Usage

```json
    {
          "step": "deleteAllPosts"
    }
```


---

## [`disableWelcomeGuides`](steps/disableWelcomeGuides.md)

**Type**: Custom Step
**Description**: Disable the welcome guides in the site editor.

*No variables defined.*

### Example Usage

```json
    {
          "step": "disableWelcomeGuides"
    }
```


---

## [`doAction`](steps/doAction.md)

**Type**: Custom Step
**Description**: Execute a custom action.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `action` | text | ✅ Yes | Execute a custom action. |
| `parameter1` | text | ❌ No | First parameter for the action. |
| `parameter2` | text | ❌ No | Second parameter for the action. |
| `parameter3` | text | ❌ No | Third parameter for the action. |
| `parameter4` | text | ❌ No | Fourth parameter for the action. |
| `parameter5` | text | ❌ No | Fifth parameter for the action. |


### Example Usage

```json
    {
          "step": "doAction",
          "vars": {
                "action": "example-value",
                "parameter1": "example-value",
                "parameter2": "example-value",
                "parameter3": "example-value",
                "parameter4": "example-value",
                "parameter5": "example-value"
          }
    }
```


---

## [`dontLogin`](steps/dontLogin.md)

**Type**: Custom Step
**Description**: Prevent automatic login (Playground logs in as admin by default).

*No variables defined.*

### Example Usage

```json
    {
          "step": "dontLogin"
    }
```


---

## [`enableIntl`](steps/enableIntl.md)

**Type**: Custom Step
**Description**: Enable PHP Intl extension support.

*No variables defined.*

### Example Usage

```json
    {
          "step": "enableIntl"
    }
```


---

## [`enableMultisite`](steps/enableMultisite.md)

**Type**: Built-in Step
**Description**: Enable WordPress Multisite functionality.

*No variables defined.*

### Example Usage

```json
    {
          "step": "enableMultisite"
    }
```


---

## [`enqueueCss`](steps/enqueueCss.md)

**Type**: Custom Step
**Description**: Enqueue custom CSS on frontend and/or admin.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the CSS file (without .css extension) |
| `css` | textarea | ✅ Yes | CSS code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


### Example Usage

```json
    {
          "step": "enqueueCss",
          "vars": {
                "filename": "custom-styles",
                "css": "body { background: #f0f0f0; }",
                "frontend": true,
                "wpAdmin": true
          }
    }
```


---

## [`enqueueJs`](steps/enqueueJs.md)

**Type**: Custom Step
**Description**: Enqueue custom JavaScript on frontend and/or admin.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the JavaScript file (without .js extension) |
| `js` | textarea | ✅ Yes | JavaScript code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


### Example Usage

```json
    {
          "step": "enqueueJs",
          "vars": {
                "filename": "custom-script",
                "js": "console.log('Hello from custom script!');",
                "frontend": true,
                "wpAdmin": true
          }
    }
```


---

## [`fakeHttpResponse`](steps/fakeHttpResponse.md)

**Type**: Custom Step
**Description**: Fake a wp_remote_request() response.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | url | ✅ Yes | URL like https://wordpress.org/ |
| `response` | textarea | ❌ No | The data to return |


### Example Usage

```json
    {
          "step": "fakeHttpResponse",
          "vars": {
                "url": "https://wordpress.org/",
                "response": "hello world"
          }
    }
```


---

## [`generateProducts`](steps/generateProducts.md)

**Type**: Custom Step
**Description**: Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `count` | number | ❌ No | Number of products to generate |
| `orders` | number | ❌ No | Number of orders to generate (optional) |
| `customers` | number | ❌ No | Number of customers to generate (optional) |
| `coupons` | number | ❌ No | Number of coupons to generate (optional) |
| `categories` | number | ❌ No | Number of product categories to generate (optional) |


### Example Usage

```json
    {
          "step": "generateProducts",
          "vars": {
                "count": 10,
                "orders": 5,
                "customers": 3,
                "coupons": 2,
                "categories": 3
          }
    }
```


---

## [`githubImportExportWxr`](steps/githubImportExportWxr.md)

**Type**: Custom Step
**Description**: Provide useful additional info.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `repo` | string | ✅ Yes | The WXR file resides in this GitHub repository. |
| `branch` | string | ❌ No | Which branch to use. |
| `filename` | string | ✅ Yes | Which filename and path to use. |
| `targetUrl` | string | ❌ No | Rewrite the exported paths to this destination URL. |


### Example Usage

```json
    {
          "step": "githubImportExportWxr",
          "vars": {
                "repo": "carstingaxion/gatherpress-demo-data",
                "branch": "main",
                "filename": "GatherPress-demo-data-2024.xml",
                "targetUrl": "https://gatherpress.test"
          }
    }
```


---

## [`githubPlugin`](steps/githubPlugin.md)

**Type**: Custom Step
**Description**: Install a plugin from a Github repository.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Github URL of the plugin. |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


### Example Usage

```json
    {
          "step": "githubPlugin",
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder",
                "prs": false
          }
    }
```


---

## [`githubPluginRelease`](steps/githubPluginRelease.md)

**Type**: Custom Step
**Description**: Install a specific plugin release from a Github repository.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `repo` | string | ✅ Yes | The plugin resides in this GitHub repository. |
| `release` | string | ✅ Yes | The release tag. |
| `filename` | string | ✅ Yes | Which filename to use. |


### Example Usage

```json
    {
          "step": "githubPluginRelease",
          "vars": {
                "repo": "ryanwelcher/interactivity-api-todomvc",
                "release": "v0.1.3",
                "filename": "to-do-mvc.zip"
          }
    }
```


---

## [`githubTheme`](steps/githubTheme.md)

**Type**: Custom Step
**Description**: Install a theme from a Github repository.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Github URL of the theme. |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


### Example Usage

```json
    {
          "step": "githubTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso",
                "prs": false
          }
    }
```


---

## [`gitPlugin`](steps/gitPlugin.md)

**Type**: Custom Step
**Description**: Install a plugin from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Git URL of the plugin (supports GitHub, GitLab, Bitbucket, Codeberg, and other git hosts). |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |


### Example Usage

```json
    {
          "step": "gitPlugin",
          "vars": {
                "url": "https://github.com/akirk/blueprint-recorder",
                "prs": false
          }
    }
```


---

## [`gitTheme`](steps/gitTheme.md)

**Type**: Custom Step
**Description**: Install a theme from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | Git URL of the theme (supports GitHub, GitLab, Bitbucket, Codeberg, and other git hosts). |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |


### Example Usage

```json
    {
          "step": "gitTheme",
          "vars": {
                "url": "https://github.com/richtabor/kanso",
                "prs": false
          }
    }
```


---

## [`importFriendFeeds`](steps/importFriendFeeds.md)

**Type**: Custom Step
**Description**: Add subscriptions to the Friends plugin.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `opml` | textarea | ✅ Yes | An OPML file, or a list of RSS feed URLs, one per line. |


### Example Usage

```json
    {
          "step": "importFriendFeeds",
          "vars": {
                "opml": "https://alex.kirk.at Alex Kirk"
          }
    }
```


---

## [`importWordPressComExport`](steps/importWordPressComExport.md)

**Type**: Custom Step
**Description**: Import a WordPress.com export file (WXR in a ZIP)

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WordPress.com export ZIP file |


### Example Usage

```json
    {
          "step": "importWordPressComExport",
          "vars": {
                "url": "https://example.com"
          }
    }
```


---

## [`importWxr`](steps/importWxr.md)

**Type**: Built-in Step
**Description**: Import a WXR from a URL.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WXR file |


### Example Usage

```json
    {
          "step": "importWxr",
          "vars": {
                "url": "https://example.com"
          }
    }
```


---

## [`installAdminer`](steps/installAdminer.md)

**Type**: Custom Step
**Description**: Install Adminer with auto login link.

*No variables defined.*

### Example Usage

```json
    {
          "step": "installAdminer"
    }
```


---

## [`installPhEditor`](steps/installPhEditor.md)

**Type**: Custom Step
**Description**: Install phEditor. Password: admin

*No variables defined.*

### Example Usage

```json
    {
          "step": "installPhEditor"
    }
```


---

## [`installPhpLiteAdmin`](steps/installPhpLiteAdmin.md)

**Type**: Custom Step
**Description**: Provide phpLiteAdmin. Password: admin

*No variables defined.*

### Example Usage

```json
    {
          "step": "installPhpLiteAdmin"
    }
```


---

## [`installPlugin`](steps/installPlugin.md)

**Type**: Built-in Step
**Description**: Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |


### Example Usage

```json
    {
          "step": "installPlugin",
          "vars": {
                "url": "hello-dolly",
                "prs": false
          }
    }
```


---

## [`installTheme`](steps/installTheme.md)

**Type**: Built-in Step
**Description**: Install a theme via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the theme or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting Pull Requests (GitHub only). |


### Example Usage

```json
    {
          "step": "installTheme",
          "vars": {
                "url": "pendant",
                "prs": false
          }
    }
```


---

## [`jetpackOfflineMode`](steps/jetpackOfflineMode.md)

**Type**: Custom Step
**Description**: Start Jetpack in Offline mode.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `blocks` | boolean | ❌ No | Activate the Jetpack Blocks module. |
| `subscriptions` | boolean | ❌ No | Activate the Jetpack Subscriptions module. |


### Example Usage

```json
    {
          "step": "jetpackOfflineMode",
          "vars": {
                "blocks": true,
                "subscriptions": true
          }
    }
```


---

## [`login`](steps/login.md)

**Type**: Built-in Step
**Description**: Login to the site.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ❌ No | Password |
| `landingPage` | boolean | ❌ No | Change landing page to wp-admin |


### Example Usage

```json
    {
          "step": "login",
          "vars": {
                "username": "admin",
                "password": "password",
                "landingPage": false
          }
    }
```


---

## [`muPlugin`](steps/muPlugin.md)

**Type**: Custom Step
**Description**: Add code for a plugin.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | text | ❌ No | Name for your mu-plugin file |
| `code` | textarea | ✅ Yes | Code for your mu-plugin |


### Example Usage

```json
    {
          "step": "muPlugin",
          "vars": {
                "name": "my-plugin",
                "code": "<?php echo \"Hello World\"; ?>"
          }
    }
```


---

## [`removeDashboardWidgets`](steps/removeDashboardWidgets.md)

**Type**: Custom Step
**Description**: Remove widgets from the wp-admin dashboard.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `welcome` | boolean | ❌ No | Remove Welcome Panel |
| `glance` | boolean | ❌ No | Remove At a Glance |
| `events` | boolean | ❌ No | Remove Upcoming Events |
| `quickpress` | boolean | ❌ No | Remove Quick Draft |
| `activity` | boolean | ❌ No | Remove Activity |
| `sitehealth` | boolean | ❌ No | Remove Site Health |


### Example Usage

```json
    {
          "step": "removeDashboardWidgets",
          "vars": {
                "welcome": true,
                "glance": true,
                "events": true,
                "quickpress": true,
                "activity": true,
                "sitehealth": true
          }
    }
```


---

## [`renameDefaultCategory`](steps/renameDefaultCategory.md)

**Type**: Custom Step
**Description**: Change the default "Uncategorized".

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `categoryName` | string | ✅ Yes | Change the default category name |
| `categorySlug` | string | ✅ Yes | Change the default category slug |


### Example Usage

```json
    {
          "step": "renameDefaultCategory",
          "vars": {
                "categoryName": "example-name",
                "categorySlug": "example-value"
          }
    }
```


---

## [`runPHP`](steps/runPHP.md)

**Type**: Built-in Step
**Description**: Run code in the context of WordPress.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `code` | textarea | ✅ Yes | The code to run |


### Example Usage

```json
    {
          "step": "runPHP",
          "vars": {
                "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
          }
    }
```


---

## [`runWpCliCommand`](steps/runWpCliCommand.md)

**Type**: Custom Step
**Description**: Run a wp-cli command.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `command` | string | ✅ Yes | The wp-cli command to run |


### Example Usage

```json
    {
          "step": "runWpCliCommand",
          "vars": {
                "command": "example-value"
          }
    }
```


---

## [`sampleContent`](steps/sampleContent.md)

**Type**: Custom Step
**Description**: Inserts sample pages to the site.

*No variables defined.*

### Example Usage

```json
    {
          "step": "sampleContent"
    }
```


---

## [`setLandingPage`](steps/setLandingPage.md)

**Type**: Custom Step
**Description**: Set the landing page.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `landingPage` | string | ✅ Yes | The relative URL for the landing page |


### Example Usage

```json
    {
          "step": "setLandingPage",
          "vars": {
                "landingPage": "/"
          }
    }
```


---

## [`setLanguage`](steps/setLanguage.md)

**Type**: Custom Step
**Description**: Set the WordPress site language.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `language` | string | ✅ Yes | A valid WordPress language slug |


### Example Usage

```json
    {
          "step": "setLanguage",
          "vars": {
                "language": "de"
          }
    }
```


---

## [`setSiteName`](steps/setSiteName.md)

**Type**: Custom Step
**Description**: Set the site name and tagline.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `sitename` | string | ✅ Yes | Name of the site |
| `tagline` | string | ✅ Yes | What the site is about |


### Example Usage

```json
    {
          "step": "setSiteName",
          "vars": {
                "sitename": "Step Library Demo",
                "tagline": "Trying out WordPress Playground."
          }
    }
```


---

## [`setSiteOption`](steps/setSiteOption.md)

**Type**: Built-in Step
**Description**: Set a site option.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ❌ No | Option name |
| `value` | string | ❌ No | Option value |


### Example Usage

```json
    {
          "step": "setSiteOption",
          "vars": {
                "name": "permalink_structure",
                "value": "/%postname%/"
          }
    }
```


---

## [`setTT4Homepage`](steps/setTT4Homepage.md)

**Type**: Custom Step
**Description**: Set the homepage for the twentytwentyfour theme.

*No variables defined.*

### Example Usage

```json
    {
          "step": "setTT4Homepage"
    }
```


---

## [`showAdminNotice`](steps/showAdminNotice.md)

**Type**: Custom Step
**Description**: Show an admin notice in the dashboard.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | string | ✅ Yes | The notice to be displayed |
| `type` | select | ❌ No | The type of notice |
| `dismissible` | boolean | ❌ No | Allow to dismiss |


### Example Usage

```json
    {
          "step": "showAdminNotice",
          "vars": {
                "text": "Welcome to WordPress Playground!",
                "type": "success",
                "dismissible": true
          }
    }
```


---

## [`siteHealthImport`](steps/siteHealthImport.md)

**Type**: Custom Step
**Description**: Import site configuration from WordPress Site Health info (Tools → Site Health → Info → Copy site info to clipboard).

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `siteHealth` | textarea | ✅ Yes | Paste the Site Health info text here. Go to Tools → Site Health → Info tab, then click "Copy site info to clipboard". |
| `installPlugins` | boolean | ❌ No | Install the plugins listed in the Site Health info. |
| `installTheme` | boolean | ❌ No | Install and activate the theme listed in the Site Health info. |


### Example Usage

```json
    {
          "step": "siteHealthImport",
          "vars": {
                "siteHealth": "example-value",
                "installPlugins": true,
                "installTheme": true
          }
    }
```


---

## [`skipWooCommerceWizard`](steps/skipWooCommerceWizard.md)

**Type**: Custom Step
**Description**: When running WooCommerce, don't show the wizard.

*No variables defined.*

### Example Usage

```json
    {
          "step": "skipWooCommerceWizard"
    }
```


---

