# Complete Steps Reference

This document provides detailed information about all available steps, including their parameters, types, and usage examples.

## Table of Contents

- [`addClientRole`](#addclientrole)
- [`addFilter`](#addfilter)
- [`addMedia`](#addmedia)
- [`addPage`](#addpage)
- [`addPost`](#addpost)
- [`addProduct`](#addproduct)
- [`blockExamples`](#blockexamples)
- [`blueprintExtractor`](#blueprintextractor)
- [`blueprintRecorder`](#blueprintrecorder)
- [`changeAdminColorScheme`](#changeadmincolorscheme)
- [`createUser`](#createuser)
- [`customPostType`](#customposttype)
- [`debug`](#debug)
- [`defineWpConfigConst`](#definewpconfigconst)
- [`deleteAllPosts`](#deleteallposts)
- [`disableWelcomeGuides`](#disablewelcomeguides)
- [`doAction`](#doaction)
- [`dontLogin`](#dontlogin)
- [`enableMultisite`](#enablemultisite)
- [`enqueueCss`](#enqueuecss)
- [`enqueueJs`](#enqueuejs)
- [`fakeHttpResponse`](#fakehttpresponse)
- [`generateProducts`](#generateproducts)
- [`githubImportExportWxr`](#githubimportexportwxr)
- [`githubPlugin`](#githubplugin)
- [`githubPluginRelease`](#githubpluginrelease)
- [`githubTheme`](#githubtheme)
- [`importFriendFeeds`](#importfriendfeeds)
- [`importWordPressComExport`](#importwordpresscomexport)
- [`importWxr`](#importwxr)
- [`installAdminer`](#installadminer)
- [`installPhEditor`](#installpheditor)
- [`installPhpLiteAdmin`](#installphpliteadmin)
- [`installPlugin`](#installplugin)
- [`installTheme`](#installtheme)
- [`jetpackOfflineMode`](#jetpackofflinemode)
- [`login`](#login)
- [`muPlugin`](#muplugin)
- [`removeDashboardWidgets`](#removedashboardwidgets)
- [`renameDefaultCategory`](#renamedefaultcategory)
- [`runPHP`](#runphp)
- [`runWpCliCommand`](#runwpclicommand)
- [`sampleContent`](#samplecontent)
- [`setLandingPage`](#setlandingpage)
- [`setLanguage`](#setlanguage)
- [`setSiteName`](#setsitename)
- [`setSiteOption`](#setsiteoption)
- [`setTT4Homepage`](#settt4homepage)
- [`showAdminNotice`](#showadminnotice)
- [`skipWooCommerceWizard`](#skipwoocommercewizard)

---

## `addClientRole`

**Type**: Custom Step  
**Description**: Adds a role for clients with additional capabilities than editors, but not quite admin.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `displayName` | string | ✅ Yes | Display name for the client role |


### Example Usage

```json
    {
          "step": "addClientRole",
          "displayName": "Client"
    }
```


---

## `addFilter`

**Type**: Custom Step  
**Description**: Easily add a filtered value.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | ✅ Yes | Name of the filter |
| `code` | textarea | ✅ Yes | Code for the filter |
| `priority` | string | ❌ No | Priority of the filter |


### Example Usage

```json
    {
          "step": "addFilter",
          "filter": "init",
          "code": "'__return_false'",
          "priority": "10"
    }
```


---

## `addMedia`

**Type**: Custom Step  
**Description**: Add files to the media library.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `downloadUrl` | string | ✅ Yes | Where to download the media from (can be a zip). |


### Example Usage

```json
    {
          "step": "addMedia",
          "downloadUrl": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
    }
```


---

## `addPage`

**Type**: Custom Step  
**Description**: Add a page with title and content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the page |
| `content` | textarea | ✅ Yes | The HTML content of the page |
| `homepage` | boolean | ❌ No | Set it as the Homepage |


### Example Usage

```json
    {
          "step": "addPage",
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "homepage": "true"
    }
```


---

## `addPost`

**Type**: Custom Step  
**Description**: Add a post with title, content, type, status, and date.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the post |
| `content` | textarea | ✅ Yes | The HTML content of the post |
| `date` | string | ❌ No | The date of the post (optional) |
| `type` | string | ✅ Yes | The post type |
| `status` | string | ❌ No | The post status |
| `postId` | text | ❌ No | Post ID to use (optional) |
| `landingPage` | boolean | ❌ No | Set landing page to the post editor (requires postId) |
| `registerPostType` | button | ❌ No | Register custom post type if needed |


### Example Usage

```json
    {
          "step": "addPost",
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "date": "now",
          "type": "post",
          "status": "publish",
          "postId": "",
          "landingPage": "true",
          "registerPostType": "example-value"
    }
```


---

## `addProduct`

**Type**: Custom Step  
**Description**: Add a WooCommerce product (will install WooCommerce if not present)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
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
          "title": "Sample Product",
          "description": "<p>This is a great product!</p>",
          "price": "19.99",
          "salePrice": "15.99",
          "sku": "PROD-001",
          "status": "publish"
    }
```


---

## `blockExamples`

**Type**: Custom Step  
**Description**: Creates a post with all block examples from registered blocks

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
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
          "blockNamespace": "",
          "postTitle": "Block Examples",
          "limit": "",
          "postId": "1000",
          "excludeCore": "false",
          "landingPage": "true"
    }
```


---

## `blueprintExtractor`

**Type**: Custom Step  
**Description**: Generate a new blueprint after modifying the WordPress.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "blueprintExtractor"
    }
```


---

## `blueprintRecorder`

**Type**: Custom Step  
**Description**: Record steps made and compile a new blueprint.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "blueprintRecorder"
    }
```


---

## `changeAdminColorScheme`

**Type**: Custom Step  
**Description**: Useful to combine with a login step.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `colorScheme` | string | ✅ Yes | Color scheme |


### Example Usage

```json
    {
          "step": "changeAdminColorScheme",
          "colorScheme": "modern"
    }
```


---

## `createUser`

**Type**: Custom Step  
**Description**: Create a new user.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
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
          "username": "user",
          "password": "password",
          "role": "administrator",
          "display_name": "User",
          "email": "",
          "login": "true"
    }
```


---

## `customPostType`

**Type**: Custom Step  
**Description**: Register a custom post type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ Yes | Post type key |
| `name` | string | ✅ Yes | The user visible label |
| `supports` | string | ❌ No | Features this post type supports |
| `public` | boolean | ❌ No | Whether the post type is public |


### Example Usage

```json
    {
          "step": "customPostType",
          "slug": "book",
          "name": "Books",
          "supports": "['title', 'editor']",
          "public": "true"
    }
```


---

## `debug`

**Type**: Custom Step  
**Description**: Configure WordPress debug settings and optionally install Query Monitor plugin.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `wpDebug` | boolean | ❌ No | Enable WordPress debug mode |
| `wpDebugDisplay` | boolean | ❌ No | Display errors in HTML output. Only applies when the above is enabled. |
| `scriptDebug` | boolean | ❌ No | Use non-minified JavaScript and CSS files. |
| `queryMonitor` | boolean | ❌ No | Install Query Monitor plugin. |


### Example Usage

```json
    {
          "step": "debug",
          "wpDebug": false,
          "wpDebugDisplay": false,
          "scriptDebug": false,
          "queryMonitor": false
    }
```


---

## `defineWpConfigConst`

**Type**: Built-in Step  
**Description**: Define a wp-config PHP constant.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ❌ No | Constant name |
| `value` | string | ❌ No | Constant value |


### Example Usage

```json
    {
          "step": "defineWpConfigConst",
          "name": "WP_DEBUG",
          "value": "true"
    }
```


---

## `deleteAllPosts`

**Type**: Custom Step  
**Description**: Delete all posts, pages, attachments, revisions and menu items.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "deleteAllPosts"
    }
```


---

## `disableWelcomeGuides`

**Type**: Custom Step  
**Description**: Disable the welcome guides in the site editor.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "disableWelcomeGuides"
    }
```


---

## `doAction`

**Type**: Custom Step  
**Description**: Execute a custom action.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
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
          "action": "",
          "parameter1": "",
          "parameter2": "",
          "parameter3": "",
          "parameter4": "",
          "parameter5": ""
    }
```


---

## `dontLogin`

**Type**: Custom Step  
**Description**: Prevent automatic login (Playground logs in as admin by default).

*No parameters defined.*

### Example Usage

```json
    {
          "step": "dontLogin"
    }
```


---

## `enableMultisite`

**Type**: Built-in Step  
**Description**: Enable WordPress Multisite functionality.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "enableMultisite"
    }
```


---

## `enqueueCss`

**Type**: Custom Step  
**Description**: Enqueue custom CSS on frontend and/or admin.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the CSS file (without .css extension) |
| `css` | textarea | ✅ Yes | CSS code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


### Example Usage

```json
    {
          "step": "enqueueCss",
          "filename": "custom-styles",
          "css": "",
          "frontend": "true",
          "wpAdmin": "true"
    }
```


---

## `enqueueJs`

**Type**: Custom Step  
**Description**: Enqueue custom JavaScript on frontend and/or admin.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the JavaScript file (without .js extension) |
| `js` | textarea | ✅ Yes | JavaScript code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


### Example Usage

```json
    {
          "step": "enqueueJs",
          "filename": "custom-script",
          "js": "",
          "frontend": "true",
          "wpAdmin": "true"
    }
```


---

## `fakeHttpResponse`

**Type**: Custom Step  
**Description**: Fake a wp_remote_request() response.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | url | ❌ No | URL like https://wordpress.org/ |
| `response` | textarea | ❌ No | The data to return |


### Example Usage

```json
    {
          "step": "fakeHttpResponse",
          "url": "",
          "response": "hello world"
    }
```


---

## `generateProducts`

**Type**: Custom Step  
**Description**: Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `count` | number | ❌ No | Number of products to generate |
| `orders` | number | ❌ No | Number of orders to generate (optional) |
| `customers` | number | ❌ No | Number of customers to generate (optional) |
| `coupons` | number | ❌ No | Number of coupons to generate (optional) |
| `categories` | number | ❌ No | Number of product categories to generate (optional) |


### Example Usage

```json
    {
          "step": "generateProducts",
          "count": "10",
          "orders": "5",
          "customers": "3",
          "coupons": "2",
          "categories": "3"
    }
```


---

## `githubImportExportWxr`

**Type**: Custom Step  
**Description**: Provide useful additional info.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | ❌ No | The WXR file resides in this GitHub repository. |
| `branch` | string | ❌ No | Which branch to use. |
| `filename` | string | ❌ No | Which filename and path to use. |
| `targetUrl` | string | ❌ No | Rewrite the exported paths to this destination URL. |


### Example Usage

```json
    {
          "step": "githubImportExportWxr",
          "repo": "carstingaxion/gatherpress-demo-data",
          "branch": "main",
          "filename": "GatherPress-demo-data-2024.xml",
          "targetUrl": "https://gatherpress.test"
    }
```


---

## `githubPlugin`

**Type**: Custom Step  
**Description**: Install a plugin from a Github repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ No | Github URL of the plugin. |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


### Example Usage

```json
    {
          "step": "githubPlugin",
          "url": "https://github.com/akirk/blueprint-recorder",
          "prs": "false"
    }
```


---

## `githubPluginRelease`

**Type**: Custom Step  
**Description**: Install a specific plugin release from a Github repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repo` | string | ❌ No | The plugin resides in this GitHub repository. |
| `release` | string | ❌ No | The release tag. |
| `filename` | string | ❌ No | Which filename to use. |


### Example Usage

```json
    {
          "step": "githubPluginRelease",
          "repo": "ryanwelcher/interactivity-api-todomvc",
          "release": "v0.1.3",
          "filename": "to-do-mvc.zip"
    }
```


---

## `githubTheme`

**Type**: Custom Step  
**Description**: Install a theme from a Github repository.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ No | Github URL of the theme. |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


### Example Usage

```json
    {
          "step": "githubTheme",
          "url": "https://github.com/richtabor/kanso",
          "prs": "false"
    }
```


---

## `importFriendFeeds`

**Type**: Custom Step  
**Description**: Add subscriptions to the Friends plugin.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `opml` | textarea | ✅ Yes | An OPML file, or a list of RSS feed URLs, one per line. |


### Example Usage

```json
    {
          "step": "importFriendFeeds",
          "opml": ""
    }
```


---

## `importWordPressComExport`

**Type**: Custom Step  
**Description**: Import a WordPress.com export file (WXR in a ZIP)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WordPress.com export ZIP file |


### Example Usage

```json
    {
          "step": "importWordPressComExport",
          "url": ""
    }
```


---

## `importWxr`

**Type**: Built-in Step  
**Description**: Import a WXR from a URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WXR file |


### Example Usage

```json
    {
          "step": "importWxr",
          "url": ""
    }
```


---

## `installAdminer`

**Type**: Custom Step  
**Description**: Install Adminer with auto login link.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "installAdminer"
    }
```


---

## `installPhEditor`

**Type**: Custom Step  
**Description**: Install phEditor. Password: admin

*No parameters defined.*

### Example Usage

```json
    {
          "step": "installPhEditor"
    }
```


---

## `installPhpLiteAdmin`

**Type**: Custom Step  
**Description**: Provide phpLiteAdmin. Password: admin

*No parameters defined.*

### Example Usage

```json
    {
          "step": "installPhpLiteAdmin"
    }
```


---

## `installPlugin`

**Type**: Built-in Step  
**Description**: Install a plugin via WordPress.org or Github (branches, releases, PRs).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting GitHub Pull Requests. |


### Example Usage

```json
    {
          "step": "installPlugin",
          "url": "hello-dolly",
          "prs": "false"
    }
```


---

## `installTheme`

**Type**: Built-in Step  
**Description**: Install a theme via WordPress.org or Github.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the theme or WordPress.org slug |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


### Example Usage

```json
    {
          "step": "installTheme",
          "url": "pendant",
          "prs": "false"
    }
```


---

## `jetpackOfflineMode`

**Type**: Custom Step  
**Description**: Start Jetpack in Offline mode.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `blocks` | boolean | ❌ No | Activate the Jetpack Blocks module. |
| `subscriptions` | boolean | ❌ No | Activate the Jetpack Subscriptions module. |


### Example Usage

```json
    {
          "step": "jetpackOfflineMode",
          "blocks": "true",
          "subscriptions": "true"
    }
```


---

## `login`

**Type**: Built-in Step  
**Description**: Login to the site.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | ✅ Yes | Username |
| `password` | string | ✅ Yes | Password |
| `landingPage` | boolean | ❌ No | Change landing page to wp-admin |


### Example Usage

```json
    {
          "step": "login",
          "username": "admin",
          "password": "password",
          "landingPage": "true"
    }
```


---

## `muPlugin`

**Type**: Custom Step  
**Description**: Add code for a plugin.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | text | ❌ No | Name for your mu-plugin file |
| `code` | textarea | ✅ Yes | Code for your mu-plugin |


### Example Usage

```json
    {
          "step": "muPlugin",
          "name": "my-plugin",
          "code": ""
    }
```


---

## `removeDashboardWidgets`

**Type**: Custom Step  
**Description**: Remove widgets from the wp-admin dashboard.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
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
          "welcome": "true",
          "glance": "true",
          "events": "true",
          "quickpress": "true",
          "activity": "true",
          "sitehealth": "true"
    }
```


---

## `renameDefaultCategory`

**Type**: Custom Step  
**Description**: Change the default "Uncategorized".

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryName` | string | ✅ Yes | Change the default category name |
| `categorySlug` | string | ✅ Yes | Change the default category slug |


### Example Usage

```json
    {
          "step": "renameDefaultCategory",
          "categoryName": "",
          "categorySlug": ""
    }
```


---

## `runPHP`

**Type**: Built-in Step  
**Description**: Run code in the context of WordPress.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | textarea | ✅ Yes | The code to run |


### Example Usage

```json
    {
          "step": "runPHP",
          "code": "<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
    }
```


---

## `runWpCliCommand`

**Type**: Custom Step  
**Description**: Run a wp-cli command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | ✅ Yes | The wp-cli command to run |


### Example Usage

```json
    {
          "step": "runWpCliCommand",
          "command": ""
    }
```


---

## `sampleContent`

**Type**: Custom Step  
**Description**: Inserts sample pages to the site.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "sampleContent"
    }
```


---

## `setLandingPage`

**Type**: Custom Step  
**Description**: Set the landing page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `landingPage` | string | ✅ Yes | The relative URL for the landing page |


### Example Usage

```json
    {
          "step": "setLandingPage",
          "landingPage": "/"
    }
```


---

## `setLanguage`

**Type**: Custom Step  
**Description**: Set the WordPress site language.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `language` | string | ✅ Yes | A valid WordPress language slug |


### Example Usage

```json
    {
          "step": "setLanguage",
          "language": "de"
    }
```


---

## `setSiteName`

**Type**: Custom Step  
**Description**: Set the site name and tagline.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sitename` | string | ✅ Yes | Name of the site |
| `tagline` | string | ✅ Yes | What the site is about |


### Example Usage

```json
    {
          "step": "setSiteName",
          "sitename": "Step Library Demo",
          "tagline": "Trying out WordPress Playground."
    }
```


---

## `setSiteOption`

**Type**: Built-in Step  
**Description**: Set a site option.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ❌ No | Option name |
| `value` | string | ❌ No | Option value |


### Example Usage

```json
    {
          "step": "setSiteOption",
          "name": "",
          "value": ""
    }
```


---

## `setTT4Homepage`

**Type**: Custom Step  
**Description**: Set the homepage for the twentytwentyfour theme.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "setTT4Homepage"
    }
```


---

## `showAdminNotice`

**Type**: Custom Step  
**Description**: Show an admin notice in the dashboard.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | ✅ Yes | The notice to be displayed |
| `type` | select | ❌ No | The type of notice |
| `dismissible` | boolean | ❌ No | Allow to dismiss |


### Example Usage

```json
    {
          "step": "showAdminNotice",
          "text": "Welcome to WordPress Playground!",
          "type": "success",
          "dismissible": "true"
    }
```


---

## `skipWooCommerceWizard`

**Type**: Custom Step  
**Description**: When running WooCommerce, don't show the wizard.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "skipWooCommerceWizard"
    }
```


---

