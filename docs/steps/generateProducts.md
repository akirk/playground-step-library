# `generateProducts` Step

Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)

**[View Source](../../steps/generateProducts.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin), [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `count` | number | ❌ No | Number of products to generate |
| `orders` | number | ❌ No | Number of orders to generate (optional) |
| `customers` | number | ❌ No | Number of customers to generate (optional) |
| `coupons` | number | ❌ No | Number of coupons to generate (optional) |
| `categories` | number | ❌ No | Number of product categories to generate (optional) |


## Examples

### Basic Usage
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

### Advanced Usage
```json
{
  "step": "generateProducts",
  "count": "25",
  "orders": "10",
  "customers": "5",
  "coupons": "5",
  "categories": "5"
}
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "wordpress.org/plugins",
        "slug": "woocommerce"
      },
      "options": {
        "activate": true
      }
    },
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "url",
        "url": "https://github.com/woocommerce/wc-smooth-generator/releases/download/1.2.2/..."
      },
      "options": {
        "activate": true
      }
    },
    {
      "step": "runPHP",
      "code": "<?php \nrequire_once '/wordpress/wp-load.php';\nerror_log( \"Debugging plugin ...",
      "progress": {
        "caption": "generateProducts: 10 products, 5 orders, 3 customers, 2 coupons, 3 categori..."
      }
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "wordpress.org/plugins",
        "slug": "woocommerce"
      },
      "options": {
        "activate": true
      }
    },
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "url",
        "url": "https://github.com/woocommerce/wc-smooth-generator/releases/download/1.2.2/wc-smooth-generator.zip"
      },
      "options": {
        "activate": true
      }
    },
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php \nrequire_once '/wordpress/wp-load.php';\n\nerror_log( \"Debugging plugin status...\" );\n\n// Check if WooCommerce is active\nif ( ! class_exists( 'WooCommerce' ) ) {\n\terror_log( \"ERROR: WooCommerce is not active or installed\" );\n\terror_log( \"Active plugins: \" . implode( ', ', get_option( 'active_plugins', array() ) ) );\n\tdie();\n}\nerror_log( \"✓ WooCommerce is active\" );\n\n// Check if WC Smooth Generator plugin files exist\n$plugin_paths = array(\n\t'/wordpress/wp-content/plugins/wc-smooth-generator/',\n\t'/wordpress/wp-content/plugins/woocommerce-smooth-generator/', \n\t'/wordpress/wp-content/plugins/wc-smooth-generator-main/',\n\t'/wordpress/wp-content/plugins/wc-smooth-generator-trunk/'\n);\n\n$found_plugin_path = false;\nforeach ( $plugin_paths as $path ) {\n\tif ( file_exists( $path ) ) {\n\t\terror_log( \"✓ Found plugin files at: \" . $path );\n\t\t$found_plugin_path = $path;\n\t\t\n\t\t// List files in plugin directory\n\t\t$files = scandir( $path );\n\t\t$file_list = array();\n\t\tforeach ( $files as $file ) {\n\t\t\tif ( $file !== '.' && $file !== '..' ) {\n\t\t\t\t$file_list[] = $file;\n\t\t\t}\n\t\t}\n\t\terror_log( \"Plugin directory contents: \" . implode( ', ', $file_list ) );\n\t\tbreak;\n\t}\n}\n\nif ( ! $found_plugin_path ) {\n\terror_log( \"ERROR: WC Smooth Generator plugin files not found in any expected location\" );\n\t$path_status = array();\n\tforeach ( $plugin_paths as $path ) {\n\t\t$path_status[] = $path . \" (exists: \" . ( file_exists( $path ) ? \"yes\" : \"no\" ) . \")\";\n\t}\n\terror_log( \"Checked paths: \" . implode( ', ', $path_status ) );\n\tdie();\n}\n\n// Check if the plugin is in active plugins list\n$active_plugins = get_option( 'active_plugins', array() );\n$smooth_generator_active = false;\nforeach ( $active_plugins as $plugin ) {\n\tif ( strpos( $plugin, 'wc-smooth-generator' ) !== false || \n\t\t strpos( $plugin, 'woocommerce-smooth-generator' ) !== false ) {\n\t\terror_log( \"✓ WC Smooth Generator found in active plugins: \" . $plugin );\n\t\t$smooth_generator_active = true;\n\t\tbreak;\n\t}\n}\n\nif ( ! $smooth_generator_active ) {\n\terror_log( \"WARNING: WC Smooth Generator not found in active plugins list\" );\n\terror_log( \"Active plugins: \" . implode( ', ', $active_plugins ) );\n\t\n\t// Try to activate the plugin manually\n\terror_log( \"Attempting to activate plugin...\" );\n\t$possible_plugin_files = array(\n\t\t'wc-smooth-generator/wc-smooth-generator.php',\n\t\t'woocommerce-smooth-generator/wc-smooth-generator.php',\n\t\t'wc-smooth-generator-main/wc-smooth-generator.php',\n\t\t'wc-smooth-generator-trunk/wc-smooth-generator.php'\n\t);\n\t\n\tforeach ( $possible_plugin_files as $plugin_file ) {\n\t\tif ( file_exists( '/wordpress/wp-content/plugins/' . $plugin_file ) ) {\n\t\t\t$result = activate_plugin( $plugin_file );\n\t\t\tif ( is_wp_error( $result ) ) {\n\t\t\t\terror_log( \"Failed to activate \" . $plugin_file . \": \" . $result->get_error_message() );\n\t\t\t} else {\n\t\t\t\terror_log( \"✓ Successfully activated: \" . $plugin_file );\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t}\n}\n\n// Final check for the required class\nif ( ! class_exists( 'WC\\SmoothGenerator\\Generator\\Product' ) ) {\n\terror_log( \"ERROR: WC\\SmoothGenerator\\Generator\\Product class still not available\" );\n\t$declared_classes = get_declared_classes();\n\t$smooth_classes = array();\n\tforeach ( $declared_classes as $class ) {\n\t\tif ( strpos( $class, 'SmoothGenerator' ) !== false ) {\n\t\t\t$smooth_classes[] = $class;\n\t\t}\n\t}\n\terror_log( \"Available WC Smooth Generator classes: \" . implode( ', ', $smooth_classes ) );\n\t\n\t// Try to manually include the plugin file\n\terror_log( \"Attempting to manually load plugin...\" );\n\t$main_files = array(\n\t\t$found_plugin_path . 'wc-smooth-generator.php',\n\t\t$found_plugin_path . 'plugin.php',\n\t\t$found_plugin_path . 'index.php'\n\t);\n\t\n\tforeach ( $main_files as $main_file ) {\n\t\tif ( file_exists( $main_file ) ) {\n\t\t\terror_log( \"Trying to include: \" . $main_file );\n\t\t\tinclude_once $main_file;\n\t\t\tif ( class_exists( 'WC\\SmoothGenerator\\Generator\\Product' ) ) {\n\t\t\t\terror_log( \"✓ Successfully loaded plugin manually\" );\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t}\n\t\n\tif ( ! class_exists( 'WC\\SmoothGenerator\\Generator\\Product' ) ) {\n\t\terror_log( \"FATAL: Unable to load WC Smooth Generator after all attempts\" );\n\t\tdie();\n\t}\n}\n\nerror_log( \"✓ WC Smooth Generator is ready\" );\nerror_log( \"Generating WooCommerce data...\" );\n\n// Generate 10 products\n$product_ids = WC\\SmoothGenerator\\Generator\\Product::batch( 10 );\nerror_log( \"Generated \" . count( $product_ids ) . \" products\" );\n\n// Generate 5 orders\n$order_ids = WC\\SmoothGenerator\\Generator\\Order::batch( 5 );\nerror_log( \"Generated \" . count( $order_ids ) . \" orders\" );\n\n// Generate 3 customers\n$customer_ids = WC\\SmoothGenerator\\Generator\\Customer::batch( 3 );\nerror_log( \"Generated \" . count( $customer_ids ) . \" customers\" );\n\n// Generate 2 coupons\n$coupon_ids = WC\\SmoothGenerator\\Generator\\Coupon::batch( 2 );\nerror_log( \"Generated \" . count( $coupon_ids ) . \" coupons\" );\n\n// Generate 3 product categories\n$term_ids = WC\\SmoothGenerator\\Generator\\Term::batch( 3, 'product_cat' );\nerror_log( \"Generated \" . count( $term_ids ) . \" product categories\" );\n"
      },
      "progress": {
        "caption": "generateProducts: 10 products, 5 orders, 3 customers, 2 coupons, 3 categories"
      }
    }
  ]
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "generateProducts",
          "count": "10",
          "orders": "5",
          "customers": "3",
          "coupons": "2",
          "categories": "3"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

