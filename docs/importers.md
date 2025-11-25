# Importers

The Step Library includes **intelligent importers** that detect various content types and convert them into blueprint steps. These importers power multiple input methods:

- **Paste** - Paste content anywhere in the UI
- **File Drop** - Drag and drop files onto the UI
- **CLI** - Use `step-library-import` command

All three methods use the same underlying content detection and conversion logic.

## Quick Reference

| Content Type | Detection | Converts To |
|--------------|-----------|-------------|
| [PHP Code](#php-code) | `<?php`, hooks, plugin patterns | `muPlugin` or `runPHP` step |
| [HTML](#html) | HTML tags | `addPost` step |
| [CSS](#css) | CSS selectors/properties | `enqueueCSS` step |
| [JavaScript](#javascript) | JS patterns | `enqueueJS` step |
| [Plugin/Theme URLs](#plugintheme-urls) | WordPress.org, GitHub URLs | `installPlugin`/`installTheme` steps |
| [wp-admin URLs](#wp-admin-urls) | `/wp-admin/` paths | `setLandingPage` step |
| [Playground URLs](#playground-urls) | `playground.wordpress.net` | Multiple steps (decompiled) |
| [Blueprint JSON](#blueprint-json) | `steps`, `landingPage`, etc. | Multiple steps (decompiled) |
| [wp-env.json](#wp-envjson) | `plugins`, `themes`, `config`, etc. | Multiple steps + settings |

## Using the CLI

The `step-library-import` command provides the same import capabilities on the command line:

```bash
# Import from stdin
echo "<?php add_action('init', fn() => {});" | step-library-import -p

# Import a file
step-library-import .wp-env.json -p

# Detect content type only
echo "https://wordpress.org/plugins/akismet/" | step-library-import -t

# Save output to file
step-library-import input.txt -o steps.json
```

See [API Documentation](api.md#import-cli) for full CLI reference.

---

## Supported Content Types

### PHP Code

PHP code is detected and converted based on its contents:

**Plugin code** (contains hooks) → `muPlugin` step:
```php
add_action('wp_footer', function() {
    echo '<p>Hello from my plugin!</p>';
});
```

**Simple scripts** → `runPHP` step:
```php
<?php
echo "Current time: " . date('Y-m-d H:i:s');
```

**What counts as a plugin?**
- Contains `add_action` or `add_filter`
- Contains `add_shortcode`
- Contains `register_post_type` or `register_taxonomy`
- Contains `add_menu_page` or `add_submenu_page`

### HTML

HTML content creates an `addPost` step:

```html
<h1>Welcome to My Site</h1>
<p>This is an example page.</p>
```

- Title extracted from first `<h1>` or `<h2>`
- Content set to the HTML
- Type set to "page"

### CSS

CSS code creates an `enqueueCSS` step:

```css
body {
    background-color: #f0f0f0;
}
.custom-class {
    color: #333;
}
```

### JavaScript

JavaScript code creates an `enqueueJS` step:

```javascript
console.log('Hello from custom script!');
document.addEventListener('DOMContentLoaded', function() {
    // Your code here
});
```

### Plugin/Theme URLs

URLs from WordPress.org or GitHub create `installPlugin` or `installTheme` steps:

**WordPress.org:**
```
https://wordpress.org/plugins/hello-dolly/
https://wordpress.org/themes/flavor/
```

**GitHub repositories:**
```
https://github.com/akirk/friends
https://github.com/Automattic/wordpress-activitypub/tree/trunk
```

**GitHub Pull Requests:**
```
https://github.com/akirk/friends/pull/559
```

**Multiple URLs** (one per line) create multiple steps.

### wp-admin URLs

WordPress admin URLs set the landing page:

```
https://playground.wordpress.net/wp-admin/post-new.php
/wp-admin/post-new.php
```

The path is extracted and used in a `setLandingPage` step.

### Playground URLs

WordPress Playground URLs are parsed and decompiled into steps:

**Hash URLs:**
```
https://playground.wordpress.net/#{"steps":[...]}
```

**Query API URLs:**
```
https://playground.wordpress.net/?plugin=woocommerce&wp=6.7&login=yes
```

See [Query API Documentation](https://wordpress.github.io/wordpress-playground/developers/apis/query-api) for URL format details.

### Blueprint JSON

Native WordPress Playground blueprints are decompiled into Step Library format:

```json
{
  "steps": [
    { "step": "login" }
  ],
  "landingPage": "/wp-admin/",
  "preferredVersions": {
    "php": "8.0",
    "wp": "6.4"
  }
}
```

**Recognized properties:**
- `steps` - Array of step objects
- `landingPage` - Landing page path
- `preferredVersions` - PHP/WordPress versions
- `features` - Feature flags
- `siteOptions` - WordPress options
- `login` - Auto-login configuration
- `plugins` - Plugin list
- `constants` - PHP constants
- `phpExtensionBundles` - PHP extensions

### wp-env.json

[wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) configuration files are converted to Playground steps:

```json
{
  "core": "WordPress/WordPress#6.4",
  "phpVersion": "8.1",
  "plugins": ["woocommerce", "WordPress/gutenberg"],
  "themes": ["flavor"],
  "config": {
    "WP_DEBUG": true
  },
  "multisite": true
}
```

**What gets converted:**

| wp-env Property | Playground Setting/Step |
|-----------------|-------------------------|
| `core` | WordPress version (extracted from URL or GitHub ref) |
| `phpVersion` | PHP version |
| `plugins` | `installPlugin` steps (WordPress.org slugs, GitHub URLs) |
| `themes` | `installTheme` steps |
| `config` | `defineWpConfigConst` steps |
| `multisite: true` | `enableMultisite` step |
| `lifecycleScripts.afterSetup` | `runWpCliCommand` step (if WP-CLI command) |
| `env.development` / `env.tests` | Merged with root config |

**What generates warnings:**

- `mappings` - File mappings (local paths not supported)
- Shell scripts in lifecycle hooks (`afterStart`, `afterClean`)
- Local paths like `.` or `./my-plugin` - UI prompts for URL resolution

---

## Input Methods

### Pasting Content

Paste content anywhere in the Step Library UI (outside of text inputs). The content is automatically detected and converted.

**Keyboard:** `Ctrl+V` / `Cmd+V`

### Dropping Files

Drag and drop `.json` files onto the Step Library window:

- **Blueprint files** - Standard blueprints, compiled blueprints, or blueprint collections
- **wp-env.json files** - wp-env configuration files

A drop overlay appears when dragging files over the window.

### Command Line

Use `step-library-import` for scripting and automation:

```bash
# Pipe content
cat my-plugin.php | step-library-import -p

# Process file
step-library-import blueprint.json -o steps.json

# Detect type only
step-library-import .wp-env.json -t
# Output: wp-env
```
