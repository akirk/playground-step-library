import type { StepFunction, AddProductStep, StepResult } from './types.js';
import { installPlugin } from './installPlugin.js';
import type { StepDefinition, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const addProduct: StepFunction<AddProductStep> = (step: AddProductStep, blueprint: any): StepResult => {
	const title = step.title || step.productTitle || '';
	const description = step.description || step.productDescription || '';
	const productPrice = step.price || step.productPrice || '';
	const productSalePrice = step.salePrice || step.productSalePrice || '';
	const productSku = step.sku || step.productSku || '';
	const productStatus = step.status || step.productStatus || 'publish';

	return {
		toV1() {
			const productTitle = title.replace(/'/g, "\\'");
			const productDescription = description.replace(/'/g, "\\'");

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
	update_post_meta( $product_id, '_regular_price', '${productPrice}' );`;

				if (productSalePrice) {
					code += `
	// Only set sale price if it's actually lower than regular price
	$regular_price = floatval('${productPrice}');
	$sale_price = floatval('${productSalePrice}');
	if ( $sale_price > 0 && $sale_price < $regular_price ) {
		update_post_meta( $product_id, '_sale_price', '${productSalePrice}' );
		update_post_meta( $product_id, '_price', '${productSalePrice}' );
	} else {
		update_post_meta( $product_id, '_price', '${productPrice}' );
	}`;
				} else {
					code += `
	update_post_meta( $product_id, '_price', '${productPrice}' );`;
				}
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

			let steps: StepDefinition[] = [];
			let hasWoocommercePlugin = false;
			for (const i in blueprint.steps) {
				if (blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'woocommerce') {
					hasWoocommercePlugin = true;
				}
			}
			if (!hasWoocommercePlugin) {
				const wooResult = installPlugin({ step: 'installPlugin', url: 'woocommerce', permalink: true }).toV1();
				if (wooResult.steps) {
					steps = wooResult.steps.concat(steps);
				}
			}

			steps.push({
				step: "runPHP",
				code: code,
				progress: {
					caption: `addProduct: ${title}`
				}
			});

			return { steps };
		},

		toV2() {
			// Check if WooCommerce is already in the blueprint
			let hasWoocommercePlugin = false;
			if (blueprint && blueprint.steps) {
				for (const i in blueprint.steps) {
					if (blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'woocommerce') {
						hasWoocommercePlugin = true;
					}
				}
			}

			const result: BlueprintV2Declaration = {
				version: 2
			};

			// Add WooCommerce plugin if not present
			if (!hasWoocommercePlugin) {
				result.plugins = ['woocommerce'];
			}

			// Create product using content array with WooCommerce meta
			const metaInput: any = {
				'_visibility': 'visible',
				'_stock_status': 'instock',
				'_manage_stock': 'no',
				'_sold_individually': 'no',
				'_virtual': 'no',
				'_downloadable': 'no'
			};

			if (productPrice) {
				metaInput['_regular_price'] = productPrice;
				metaInput['_price'] = productSalePrice || productPrice;
			}

			if (productSalePrice) {
				metaInput['_sale_price'] = productSalePrice;
			}

			if (productSku) {
				metaInput['_sku'] = productSku;
			}

			result.content = [{
				type: 'posts',
				source: {
					post_title: title,
					post_content: description,
					post_type: 'product',
					post_status: productStatus,
					meta_input: metaInput,
					tax_input: {
						'product_type': ['simple']
					}
				} as any
			}];

			return result;
		}
	};
};

addProduct.description = "Add a WooCommerce product (will install WooCommerce if not present)";
addProduct.vars = [
	{
		name: "title",
		description: "The title of the product",
		required: true,
		samples: ["Sample Product", "T-Shirt", "Digital Download"]
	},
	{
		name: "description",
		description: "The description of the product",
		type: "textarea",
		language: "markup",
		required: true,
		samples: ["<p>This is a great product!</p>", "<p>High quality item with excellent features.</p>"]
	},
	{
		name: "price",
		description: "Regular price (without currency symbol)",
		required: false,
		samples: ["19.99", "29.95", "100.00"]
	},
	{
		name: "salePrice",
		description: "Sale price (optional, must be less than regular price)",
		required: false,
		samples: ["15.99", "24.95", "80.00"]
	},
	{
		name: "sku",
		description: "Product SKU/code (optional)",
		required: false,
		samples: ["PROD-001", "SHIRT-RED-M", "DL-GUIDE-2024"]
	},
	{
		name: "status",
		description: "Product status",
		required: false,
		samples: ["publish", "draft", "private"]
	},
	{
		name: "productTitle",
		description: "The title of the product (deprecated: use 'title')",
		required: false,
		samples: ["Sample Product", "T-Shirt", "Digital Download"],
		deprecated: true
	},
	{
		name: "productDescription",
		description: "The description of the product (deprecated: use 'description')",
		type: "textarea",
		language: "markup",
		required: false,
		samples: ["<p>This is a great product!</p>", "<p>High quality item with excellent features.</p>"],
		deprecated: true
	},
	{
		name: "productPrice",
		description: "Regular price (deprecated: use 'price')",
		required: false,
		samples: ["19.99", "29.95", "100.00"],
		deprecated: true
	},
	{
		name: "productSalePrice",
		description: "Sale price (deprecated: use 'salePrice')",
		required: false,
		samples: ["15.99", "24.95", "80.00"],
		deprecated: true
	},
	{
		name: "productSku",
		description: "Product SKU/code (deprecated: use 'sku')",
		required: false,
		samples: ["PROD-001", "SHIRT-RED-M", "DL-GUIDE-2024"],
		deprecated: true
	},
	{
		name: "productStatus",
		description: "Product status (deprecated: use 'status')",
		required: false,
		samples: ["publish", "draft", "private"],
		deprecated: true
	}
];