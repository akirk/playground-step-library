import { describe, it, expect } from 'vitest';
import { addProduct } from './addProduct.js';
import type { AddProductStep } from './types.js';

describe('addProduct', () => {
    it('should create a basic product with new variable names', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            title: 'Test Product',
            description: '<p>Great product</p>',
            price: '29.99'
        };

        const result = addProduct(step, { steps: [] }).toV1();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(1);
        
        const phpStep = result.find(r => r.step === 'runPHP');
        expect(phpStep).toBeDefined();
        expect(phpStep?.code).toContain("'post_title'   => 'Test Product'");
        expect(phpStep?.code).toContain("'post_content' => '<p>Great product</p>'");
        expect(phpStep?.code).toContain("'post_type'    => 'product'");
        expect(phpStep?.code).toContain("'_regular_price', '29.99'");
        expect(phpStep?.code).toContain("'_price', '29.99'");
    });

    it('should create a product with deprecated variable names (backward compatibility)', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            productTitle: 'Test Product',
            productDescription: '<p>Great product</p>',
            productPrice: '29.99'
        };

        const result = addProduct(step, { steps: [] }).toV1();

        const phpStep = result.find(r => r.step === 'runPHP');
        expect(phpStep?.code).toContain("'post_title'   => 'Test Product'");
        expect(phpStep?.code).toContain("'post_content' => '<p>Great product</p>'");
        expect(phpStep?.code).toContain("'_regular_price', '29.99'");
    });

    it('should prefer new variable names over deprecated ones', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            title: 'New Title',
            description: '<p>New Description</p>',
            price: '19.99',
            salePrice: '15.99',
            productTitle: 'Old Title',
            productDescription: '<p>Old Description</p>',
            productPrice: '29.99',
            productSalePrice: '25.99'
        };

        const result = addProduct(step, { steps: [] }).toV1();

        const phpStep = result.find(r => r.step === 'runPHP');
        expect(phpStep?.code).toContain("'post_title'   => 'New Title'");
        expect(phpStep?.code).toContain("'post_content' => '<p>New Description</p>'");
        expect(phpStep?.code).toContain("'_regular_price', '19.99'");
        expect(phpStep?.code).toContain("'_sale_price', '15.99'");
        expect(phpStep?.code).toContain("'_price', '15.99'");
    });

    it('should handle sale pricing correctly', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            title: 'Sale Product',
            description: '<p>On sale now</p>',
            price: '100.00',
            salePrice: '80.00'
        };

        const result = addProduct(step, { steps: [] }).toV1();

        const phpStep = result.find(r => r.step === 'runPHP');
        expect(phpStep?.code).toContain('$regular_price = floatval(\'100.00\')');
        expect(phpStep?.code).toContain('$sale_price = floatval(\'80.00\')');
        expect(phpStep?.code).toContain('if ( $sale_price > 0 && $sale_price < $regular_price )');
        expect(phpStep?.code).toContain("'_sale_price', '80.00'");
        expect(phpStep?.code).toContain("'_price', '80.00'");
    });

    it('should not set sale price if it is higher than regular price', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            title: 'Invalid Sale Product',
            description: '<p>Invalid sale</p>',
            price: '50.00',
            salePrice: '60.00' // Higher than regular price
        };

        const result = addProduct(step, { steps: [] }).toV1();

        const phpStep = result.find(r => r.step === 'runPHP');
        expect(phpStep?.code).toContain("'_regular_price', '50.00'");
        expect(phpStep?.code).toContain("'_price', '50.00'");
        // Should contain the PHP validation logic
        expect(phpStep?.code).toContain('if ( $sale_price > 0 && $sale_price < $regular_price )');
        expect(phpStep?.code).toContain('} else {');
        expect(phpStep?.code).toContain("update_post_meta( $product_id, '_price', '50.00' )");
    });

    it('should include SKU and status when provided', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            title: 'Product with SKU',
            description: '<p>Has SKU</p>',
            price: '25.00',
            sku: 'PROD-123',
            status: 'draft'
        };

        const result = addProduct(step, { steps: [] }).toV1();

        const phpStep = result.find(r => r.step === 'runPHP');
        expect(phpStep?.code).toContain("'post_status'  => 'draft'");
        expect(phpStep?.code).toContain("'_sku', 'PROD-123'");
    });

    it('should auto-install WooCommerce if not present', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            title: 'Test Product',
            description: '<p>Test</p>',
            price: '10.00'
        };

        const blueprint = { steps: [] }; // No WooCommerce plugin
        const result = addProduct(step, blueprint).toV1();

        // Should include installPlugin step for WooCommerce
        const installStep = result.find(r => r.step === 'installPlugin');
        expect(installStep).toBeDefined();
    });

    it('should not auto-install WooCommerce if already present', () => {
        const step: AddProductStep = {
            step: 'addProduct',
            title: 'Test Product',
            description: '<p>Test</p>',
            price: '10.00'
        };

        const blueprint = { 
            steps: [
                { step: 'installPlugin', vars: { url: 'woocommerce' } }
            ]
        };
        const result = addProduct(step, blueprint).toV1();

        // Should not include additional installPlugin step
        const installSteps = result.filter(r => r.step === 'installPlugin');
        expect(installSteps).toHaveLength(0);
    });

    it('should have correct metadata', () => {
        expect(addProduct.description).toBe('Add a WooCommerce product (will install WooCommerce if not present)');
        expect(Array.isArray(addProduct.vars)).toBe(true);
        expect(addProduct.vars.length).toBeGreaterThan(6); // Includes deprecated vars

        // Check new variable names
        const titleVar = addProduct.vars.find(v => v.name === 'title');
        expect(titleVar).toBeDefined();
        expect(titleVar?.required).toBe(true);
        expect(titleVar?.deprecated).toBeFalsy();

        const priceVar = addProduct.vars.find(v => v.name === 'price');
        expect(priceVar).toBeDefined();
        expect(priceVar?.required).toBe(false);

        const salePriceVar = addProduct.vars.find(v => v.name === 'salePrice');
        expect(salePriceVar).toBeDefined();

        // Check deprecated variables
        const deprecatedTitleVar = addProduct.vars.find(v => v.name === 'productTitle');
        expect(deprecatedTitleVar?.deprecated).toBe(true);

        const deprecatedPriceVar = addProduct.vars.find(v => v.name === 'productPrice');
        expect(deprecatedPriceVar?.deprecated).toBe(true);
    });
});