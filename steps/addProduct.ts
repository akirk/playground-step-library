import type { StepFunction, AddProductStep} from './types.js';
import { installPlugin } from './installPlugin.js';


export const addProduct: StepFunction<AddProductStep> = (step: AddProductStep, blueprint: any) => {
	const productTitle = step.productTitle?.replace(/'/g, "\\'") || '';
	const productDescription = step.productDescription?.replace(/'/g, "\\'") || '';
	const productPrice = step.productPrice || '';
	const productSalePrice = step.productSalePrice || '';
	const productSku = step.productSku || '';
	const productStatus = step.productStatus || 'publish';

	let code = `
<?php require_once '/wordpress/wp-load.php';

// Create the product post
$product_args = array(
	'post_type'    => 'product',
	'post_status'  => '${productStatus}',
	'post_title'   => '${productTitle}',
	'post_content' => '${productDescription}',
);
$product_id = wp_insert_post( $product_args );

if ( $product_id && ! is_wp_error( $product_id ) ) {`;

	// Add product meta data
	if (productPrice) {
		code += `
	update_post_meta( $product_id, '_price', '${productPrice}' );
	update_post_meta( $product_id, '_regular_price', '${productPrice}' );`;
	}

	if (productSalePrice) {
		code += `
	update_post_meta( $product_id, '_sale_price', '${productSalePrice}' );`;
	}

	if (productSku) {
		code += `
	update_post_meta( $product_id, '_sku', '${productSku}' );`;
	}

	// Set basic WooCommerce product settings
	code += `
	update_post_meta( $product_id, '_visibility', 'visible' );
	update_post_meta( $product_id, '_stock_status', 'instock' );
	update_post_meta( $product_id, '_manage_stock', 'no' );
	update_post_meta( $product_id, '_sold_individually', 'no' );
	update_post_meta( $product_id, '_virtual', 'no' );
	update_post_meta( $product_id, '_downloadable', 'no' );
	
	// Set product type (simple product)
	wp_set_object_terms( $product_id, 'simple', 'product_type' );
	
	// Clear any caches
	if ( function_exists( 'wc_delete_product_transients' ) ) {
		wc_delete_product_transients( $product_id );
	}
}`;

	let steps: any[] = [];
	let hasWoocommercePlugin = false;
	for (const i in blueprint.steps) {
		if (blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'woocommerce') {
			hasWoocommercePlugin = true;
		}
	}
	if (!hasWoocommercePlugin) {
		steps = installPlugin({ step: 'installPlugin', url: 'woocommerce', permalink: true }).concat(steps);
	}

	steps.push({
		"step": "runPHP",
		"code": code
	});

	return steps;
};

addProduct.description = "Add a WooCommerce product (will install WooCommerce if not present)";
addProduct.vars = Object.entries({
	productTitle: {
		description: "The title of the product",
		required: true,
		samples: ["Sample Product", "T-Shirt", "Digital Download"]
	},
	productDescription: {
		description: "The description of the product",
		type: "textarea",
		required: true,
		samples: ["<p>This is a great product!</p>", "<p>High quality item with excellent features.</p>"]
	},
	productPrice: {
		description: "Regular price (without currency symbol)",
		required: false,
		samples: ["19.99", "29.95", "100.00"]
	},
	productSalePrice: {
		description: "Sale price (optional, must be less than regular price)",
		required: false,
		samples: ["15.99", "24.95", "80.00"]
	},
	productSku: {
		description: "Product SKU/code (optional)",
		required: false,
		samples: ["PROD-001", "SHIRT-RED-M", "DL-GUIDE-2024"]
	},
	productStatus: {
		description: "Product status",
		required: false,
		samples: ["publish", "draft", "private"]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));