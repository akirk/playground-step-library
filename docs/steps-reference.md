# Complete Steps Reference

This document provides detailed information about all available steps, including their parameters, types, and usage examples.

## Table of Contents

- [`addClientRole`](#addclientrole)
- [`addCorsProxy`](#addcorsproxy)
- [`addFilter`](#addfilter)
- [`addMedia`](#addmedia)
- [`addPage`](#addpage)
- [`addPost`](#addpost)
- [`addProduct`](#addproduct)
- [`blueprintExtractor`](#blueprintextractor)
- [`blueprintRecorder`](#blueprintrecorder)
- [`changeAdminColorScheme`](#changeadmincolorscheme)
- [`createUser`](#createuser)
- [`customPostType`](#customposttype)
- [`defineWpConfigConst`](#definewpconfigconst)
- [`deleteAllPosts`](#deleteallposts)
- [`disableWelcomeGuides`](#disablewelcomeguides)
- [`doAction`](#doaction)
- [`enableMultisite`](#enablemultisite)
- [`fakeHttpResponse`](#fakehttpresponse)
- [`githubImportExportWxr`](#githubimportexportwxr)
- [`githubPlugin`](#githubplugin)
- [`githubPluginRelease`](#githubpluginrelease)
- [`githubTheme`](#githubtheme)
- [`importFriendFeeds`](#importfriendfeeds)
- [`importWordPressComExport`](#importwordpresscomexport)
- [`importWxr`](#importwxr)
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

## `addCorsProxy`

**Type**: Custom Step  
**Description**: Automatically add the CORS proxy to outgoing HTTP requests.

*No parameters defined.*

### Example Usage

```json
    {
          "step": "addCorsProxy"
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
**Description**: Add a custom page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `postTitle` | string | ✅ Yes | The title of the post |
| `postContent` | textarea | ✅ Yes | The HTML of the post |
| `homepage` | boolean | ❌ No | Set it as the Homepage |


### Example Usage

```json
    {
          "step": "addPage",
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
          "homepage": "true"
    }
```


---

## `addPost`

**Type**: Custom Step  
**Description**: Add a post.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `postTitle` | string | ✅ Yes | The title of the post |
| `postContent` | textarea | ✅ Yes | The HTML of the post |
| `postDate` | string | ❌ No | The date of the post (optional) |
| `postType` | string | ✅ Yes | The post type |
| `postStatus` | string | ❌ No | The post status |
| `registerPostType` | button | ❌ No | Register custom post type if needed |


### Example Usage

```json
    {
          "step": "addPost",
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
          "postDate": "now",
          "postType": "post",
          "postStatus": "publish",
          "registerPostType": "example-value"
    }
```


---

## `addProduct`

**Type**: Custom Step  
**Description**: Add a WooCommerce product (will install WooCommerce if not present)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productTitle` | string | ✅ Yes | The title of the product |
| `productDescription` | textarea | ✅ Yes | The description of the product |
| `productPrice` | string | ❌ No | Regular price (without currency symbol) |
| `productSalePrice` | string | ❌ No | Sale price (optional, must be less than regular price) |
| `productSku` | string | ❌ No | Product SKU/code (optional) |
| `productStatus` | string | ❌ No | Product status |


### Example Usage

```json
    {
          "step": "addProduct",
          "productTitle": "Sample Product",
          "productDescription": "<p>This is a great product!</p>",
          "productPrice": "19.99",
          "productSalePrice": "15.99",
          "productSku": "PROD-001",
          "productStatus": "publish"
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
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |


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
| `release` | string | ❌ No | The release slug. |
| `filename` | string | ❌ No | Which filename to use. |


### Example Usage

```json
    {
          "step": "githubPluginRelease",
          "repo": "ryanwelcher/interactivity-api-todomvc",
          "release": "v0.1.3",
          "filename": " to-do-mvc.zip "
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
| `corsProxy` | boolean | ✅ Yes | Use a cors proxy for the request |


### Example Usage

```json
    {
          "step": "importWordPressComExport",
          "url": "",
          "corsProxy": "true"
    }
```


---

## `importWxr`

**Type**: Built-in Step  
**Description**: Import a WXR from a URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WXR file |
| `corsProxy` | boolean | ✅ Yes | Use a cors proxy for the request |


### Example Usage

```json
    {
          "step": "importWxr",
          "url": "",
          "corsProxy": "true"
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
**Description**: Install a plugin via WordPress.org or Github

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of the plugin or WordPress.org slug. |
| `prs` | boolean | ❌ No | Add support for submitting Github Requests. |
| `permalink` | boolean | ❌ No | Requires a permalink structure |


### Example Usage

```json
    {
          "step": "installPlugin",
          "url": "hello-dolly",
          "prs": "false",
          "permalink": false
    }
```


---

## `installTheme`

**Type**: Built-in Step  
**Description**: Install a theme via WordPress.org or Github

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
**Description**: Login to the site

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
| `code` | textarea | ✅ Yes | Code for your mu-plugin |


### Example Usage

```json
    {
          "step": "muPlugin",
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
          "code": ""
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

*Generated automatically from step definitions on 2025-09-05T12:57:52.829Z*