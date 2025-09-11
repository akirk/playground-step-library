import type { StepFunction, GenerateProductsStep } from './types.js';
import { installPlugin } from './installPlugin.js';
import { githubPlugin } from './githubPlugin.js';

/**
 * Converts GitHub URLs to github-proxy URLs
 * Supports:
 * - https://github.com/owner/repo/releases/latest -> https://github-proxy.com/proxy/?repo=owner/repo&releases=latest
 * - https://github.com/owner/repo/releases/tag/v1.0.0 -> https://github-proxy.com/proxy/?repo=owner/repo&releases=v1.0.0
 * - https://github.com/owner/repo -> uses githubPlugin for branch-based installs
 */
function convertGitHubUrl(url: string): { type: 'releases' | 'branch', url: string } {
	// Check for releases/latest URL
	const releasesLatestMatch = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/releases\/latest\/?$/.exec(url);
	if (releasesLatestMatch) {
		const [, org, repo] = releasesLatestMatch;
		return {
			type: 'releases',
			url: `https://github-proxy.com/proxy/?repo=${org}/${repo}&releases=latest`
		};
	}
	
	// Check for releases/tag URL
	const releasesTagMatch = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)\/?$/.exec(url);
	if (releasesTagMatch) {
		const [, org, repo, tag] = releasesTagMatch;
		return {
			type: 'releases',
			url: `https://github-proxy.com/proxy/?repo=${org}/${repo}&releases=${tag}`
		};
	}
	
	// Default to branch-based (handled by githubPlugin)
	return {
		type: 'branch',
		url: url
	};
}

export const generateProducts: StepFunction<GenerateProductsStep> = (step: GenerateProductsStep, blueprint: any) => {
	const productCount = step.count || 10;
	const orderCount = step.orders || 0;
	const customerCount = step.customers || 0;
	const couponCount = step.coupons || 0;
	const categoryCount = step.categories || 0;

	let code = `<?php 
require_once '/wordpress/wp-load.php';

error_log( "Debugging plugin status..." );

// Check if WooCommerce is active
if ( ! class_exists( 'WooCommerce' ) ) {
	error_log( "ERROR: WooCommerce is not active or installed" );
	error_log( "Active plugins: " . implode( ', ', get_option( 'active_plugins', array() ) ) );
	die();
}
error_log( "✓ WooCommerce is active" );

// Check if WC Smooth Generator plugin files exist
$plugin_paths = array(
	'/wordpress/wp-content/plugins/wc-smooth-generator/',
	'/wordpress/wp-content/plugins/woocommerce-smooth-generator/', 
	'/wordpress/wp-content/plugins/wc-smooth-generator-main/',
	'/wordpress/wp-content/plugins/wc-smooth-generator-trunk/'
);

$found_plugin_path = false;
foreach ( $plugin_paths as $path ) {
	if ( file_exists( $path ) ) {
		error_log( "✓ Found plugin files at: " . $path );
		$found_plugin_path = $path;
		
		// List files in plugin directory
		$files = scandir( $path );
		$file_list = array();
		foreach ( $files as $file ) {
			if ( $file !== '.' && $file !== '..' ) {
				$file_list[] = $file;
			}
		}
		error_log( "Plugin directory contents: " . implode( ', ', $file_list ) );
		break;
	}
}

if ( ! $found_plugin_path ) {
	error_log( "ERROR: WC Smooth Generator plugin files not found in any expected location" );
	$path_status = array();
	foreach ( $plugin_paths as $path ) {
		$path_status[] = $path . " (exists: " . ( file_exists( $path ) ? "yes" : "no" ) . ")";
	}
	error_log( "Checked paths: " . implode( ', ', $path_status ) );
	die();
}

// Check if the plugin is in active plugins list
$active_plugins = get_option( 'active_plugins', array() );
$smooth_generator_active = false;
foreach ( $active_plugins as $plugin ) {
	if ( strpos( $plugin, 'wc-smooth-generator' ) !== false || 
		 strpos( $plugin, 'woocommerce-smooth-generator' ) !== false ) {
		error_log( "✓ WC Smooth Generator found in active plugins: " . $plugin );
		$smooth_generator_active = true;
		break;
	}
}

if ( ! $smooth_generator_active ) {
	error_log( "WARNING: WC Smooth Generator not found in active plugins list" );
	error_log( "Active plugins: " . implode( ', ', $active_plugins ) );
	
	// Try to activate the plugin manually
	error_log( "Attempting to activate plugin..." );
	$possible_plugin_files = array(
		'wc-smooth-generator/wc-smooth-generator.php',
		'woocommerce-smooth-generator/wc-smooth-generator.php',
		'wc-smooth-generator-main/wc-smooth-generator.php',
		'wc-smooth-generator-trunk/wc-smooth-generator.php'
	);
	
	foreach ( $possible_plugin_files as $plugin_file ) {
		if ( file_exists( '/wordpress/wp-content/plugins/' . $plugin_file ) ) {
			$result = activate_plugin( $plugin_file );
			if ( is_wp_error( $result ) ) {
				error_log( "Failed to activate " . $plugin_file . ": " . $result->get_error_message() );
			} else {
				error_log( "✓ Successfully activated: " . $plugin_file );
				break;
			}
		}
	}
}

// Final check for the required class
if ( ! class_exists( 'WC\\SmoothGenerator\\Generator\\Product' ) ) {
	error_log( "ERROR: WC\\SmoothGenerator\\Generator\\Product class still not available" );
	$declared_classes = get_declared_classes();
	$smooth_classes = array();
	foreach ( $declared_classes as $class ) {
		if ( strpos( $class, 'SmoothGenerator' ) !== false ) {
			$smooth_classes[] = $class;
		}
	}
	error_log( "Available WC Smooth Generator classes: " . implode( ', ', $smooth_classes ) );
	
	// Try to manually include the plugin file
	error_log( "Attempting to manually load plugin..." );
	$main_files = array(
		$found_plugin_path . 'wc-smooth-generator.php',
		$found_plugin_path . 'plugin.php',
		$found_plugin_path . 'index.php'
	);
	
	foreach ( $main_files as $main_file ) {
		if ( file_exists( $main_file ) ) {
			error_log( "Trying to include: " . $main_file );
			include_once $main_file;
			if ( class_exists( 'WC\\SmoothGenerator\\Generator\\Product' ) ) {
				error_log( "✓ Successfully loaded plugin manually" );
				break;
			}
		}
	}
	
	if ( ! class_exists( 'WC\\SmoothGenerator\\Generator\\Product' ) ) {
		error_log( "FATAL: Unable to load WC Smooth Generator after all attempts" );
		die();
	}
}

error_log( "✓ WC Smooth Generator is ready" );
error_log( "Generating WooCommerce data..." );
`;

	// Generate products
	if (productCount > 0) {
		code += `
// Generate ${productCount} products
$product_ids = WC\\SmoothGenerator\\Generator\\Product::batch( ${productCount} );
error_log( "Generated " . count( $product_ids ) . " products" );
`;
	}

	// Generate orders if requested
	if (orderCount > 0) {
		code += `
// Generate ${orderCount} orders
$order_ids = WC\\SmoothGenerator\\Generator\\Order::batch( ${orderCount} );
error_log( "Generated " . count( $order_ids ) . " orders" );
`;
	}

	// Generate customers if requested
	if (customerCount > 0) {
		code += `
// Generate ${customerCount} customers
$customer_ids = WC\\SmoothGenerator\\Generator\\Customer::batch( ${customerCount} );
error_log( "Generated " . count( $customer_ids ) . " customers" );
`;
	}

	// Generate coupons if requested
	if (couponCount > 0) {
		code += `
// Generate ${couponCount} coupons
$coupon_ids = WC\\SmoothGenerator\\Generator\\Coupon::batch( ${couponCount} );
error_log( "Generated " . count( $coupon_ids ) . " coupons" );
`;
	}

	// Generate categories if requested
	if (categoryCount > 0) {
		code += `
// Generate ${categoryCount} product categories
$term_ids = WC\\SmoothGenerator\\Generator\\Term::batch( ${categoryCount}, 'product_cat' );
error_log( "Generated " . count( $term_ids ) . " product categories" );
`;
	}

	let steps: any[] = [];

	// Convert GitHub URL using utility function
	const githubUrl = 'https://github.com/woocommerce/wc-smooth-generator/releases/tag/1.2.2';
	const convertedUrl = convertGitHubUrl(githubUrl);

	// Check if WooCommerce is already installed
	let hasWoocommercePlugin = false;
	let hasSmoothGeneratorPlugin = false;
	for (const i in blueprint.steps) {
		if (blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'woocommerce') {
			hasWoocommercePlugin = true;
		}
		// Check for both the original URL and converted URL patterns
		if ((blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === convertedUrl.url) ||
			(blueprint.steps[i].step === 'githubPlugin' && blueprint.steps[i]?.vars?.url === githubUrl)) {
			hasSmoothGeneratorPlugin = true;
		}
	}

	// Install WooCommerce if not present
	if (!hasWoocommercePlugin) {
		steps = steps.concat(installPlugin({ step: 'installPlugin', url: 'woocommerce', permalink: true }));
	}

	// Install WC Smooth Generator plugin if not present
	if (!hasSmoothGeneratorPlugin) {
		if (convertedUrl.type === 'releases') {
			// Use installPlugin directly for releases URLs - without activation
			steps.push({
				"step": "installPlugin",
				"pluginData": {
					"resource": "url",
					"url": convertedUrl.url
				},
				"options": {
					"activate": false
				}
			});
		} else {
			// Use githubPlugin for branch-based URLs (already doesn't activate)
			steps = steps.concat(githubPlugin({ step: 'githubPlugin', url: convertedUrl.url }));
		}
		
		// Add separate activation step for all cases
		steps.push({
			"step": "runPHP",
			"code": `<?php 
try {
	require_once '/wordpress/wp-load.php'; 
	error_log("Attempting to activate WC Smooth Generator plugin...");
	$plugins = array(
		'wc-smooth-generator/wc-smooth-generator.php',
		'woocommerce-smooth-generator/wc-smooth-generator.php', 
		'wc-smooth-generator-main/wc-smooth-generator.php',
		'wc-smooth-generator-trunk/wc-smooth-generator.php'
	);
	foreach ($plugins as $plugin) {
		if (file_exists('/wordpress/wp-content/plugins/' . $plugin)) {
			error_log("Found plugin file: " . $plugin);
			try {
				$result = activate_plugin($plugin);
				if (is_wp_error($result)) {
					error_log("Failed to activate " . $plugin . ": " . $result->get_error_message());
				} else {
					error_log("Successfully activated WC Smooth Generator plugin: " . $plugin);
					break;
				}
			} catch (Exception $e) {
				error_log("Exception during activation of " . $plugin . ": " . $e->getMessage());
			} catch (Error $e) {
				error_log("Fatal error during activation of " . $plugin . ": " . $e->getMessage());
			}
		} else {
			error_log("Plugin file not found: " . $plugin);
		}
	}
} catch (Exception $e) {
	error_log("Exception in activation step: " . $e->getMessage());
} catch (Error $e) {
	error_log("Fatal error in activation step: " . $e->getMessage());
} ?>`
		});
	}

	steps.push({
		"step": "runPHP",
		"code": code
	});

	return steps;
};

generateProducts.description = "Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)";
generateProducts.vars = Object.entries({
	count: {
		description: "Number of products to generate",
		type: "number",
		required: false,
		samples: ["10", "25", "50", "100"]
	},
	orders: {
		description: "Number of orders to generate (optional)",
		type: "number",
		required: false,
		samples: ["5", "10", "20"]
	},
	customers: {
		description: "Number of customers to generate (optional)",
		type: "number",
		required: false,
		samples: ["3", "5", "10"]
	},
	coupons: {
		description: "Number of coupons to generate (optional)",
		type: "number",
		required: false,
		samples: ["2", "5", "8"]
	},
	categories: {
		description: "Number of product categories to generate (optional)",
		type: "number",
		required: false,
		samples: ["3", "5", "8"]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));
