# Built-in Step Usage Reference

This page shows which custom steps compile to each built-in WordPress Playground step.

## Step Types

- 🔧 **Built-in Step** - Core WordPress Playground steps enhanced with additional functionality
- ⚡ **Custom Step** - New steps that extend Playground beyond its core capabilities

## Table of Contents

- [`defineWpConfigConsts`](#definewpconfigconsts)
- [`enableMultisite`](#enablemultisite)
- [`login`](#login)
- [`mkdir`](#mkdir)
- [`runPHP`](#runphp)
- [`updateUserMeta`](#updateusermeta)
- [`wp-cli`](#wp-cli)
- [`writeFile`](#writefile)

---

## `defineWpConfigConsts`

**Used by 2 steps:**

- ⚡ [`debug`](steps/debug.md) - Configure WordPress debug settings and optionally install Query Monitor plugin.
- 🔧 [`defineWpConfigConst`](steps/defineWpConfigConst.md) - Define a wp-config PHP constant.

---

## `enableMultisite`

**Used by 1 step:**

- 🔧 [`enableMultisite`](steps/enableMultisite.md) - Enable WordPress Multisite functionality.

---

## `login`

**Used by 2 steps:**

- ⚡ [`createUser`](steps/createUser.md) - Create a new user.
- 🔧 [`login`](steps/login.md) - Login to the site.

---

## `mkdir`

**Used by 7 steps:**

- ⚡ [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- ⚡ [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`customPostType`](steps/customPostType.md) - Register a custom post type.
- ⚡ [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- ⚡ [`fakeHttpResponse`](steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- ⚡ [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.

---

## `runPHP`

**Used by 7 steps:**

- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`addPage`](steps/addPage.md) - Add a page with title and content.
- ⚡ [`addPost`](steps/addPost.md) - Add a post with title, content, type, status, and date.
- ⚡ [`addProduct`](steps/addProduct.md) - Add a WooCommerce product (will install WooCommerce if not present)
- ⚡ [`createUser`](steps/createUser.md) - Create a new user.
- ⚡ [`deleteAllPosts`](steps/deleteAllPosts.md) - Delete all posts, pages, attachments, revisions and menu items.
- 🔧 [`runPHP`](steps/runPHP.md) - Run code in the context of WordPress.

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

**Used by 7 steps:**

- ⚡ [`addClientRole`](steps/addClientRole.md) - Adds a role for clients with additional capabilities than editors, but not quite admin.
- ⚡ [`addFilter`](steps/addFilter.md) - Easily add a filtered value.
- ⚡ [`addMedia`](steps/addMedia.md) - Add files to the media library.
- ⚡ [`customPostType`](steps/customPostType.md) - Register a custom post type.
- ⚡ [`disableWelcomeGuides`](steps/disableWelcomeGuides.md) - Disable the welcome guides in the site editor.
- ⚡ [`fakeHttpResponse`](steps/fakeHttpResponse.md) - Fake a wp_remote_request() response.
- ⚡ [`muPlugin`](steps/muPlugin.md) - Add code for a plugin.

---

