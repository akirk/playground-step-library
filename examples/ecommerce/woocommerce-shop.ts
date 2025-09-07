/**
 * WooCommerce Shop Setup
 * Complete e-commerce site with WooCommerce plugin and real products
 */

import { runCLI, RunCLIServer } from '@wp-playground/cli';
import PlaygroundStepLibrary from '../../lib/src/index';

const compiler = new PlaygroundStepLibrary();

const blueprint = {
  login: true,
  landingPage: '/shop/',
  steps: [
    // Site configuration
    {
      step: 'setSiteName',
      sitename: 'WooCommerce Demo Shop',
      tagline: 'Your Complete Online Store'
    },

    // Install WooCommerce plugin
    {
      step: 'installPlugin',
      url: 'https://wordpress.org/plugins/woocommerce'
    },

    // Create shop manager user
    {
      step: 'createUser',
      username: 'shopmanager',
      password: 'shop123',
      email: 'manager@shop.com',
      role: 'administrator'
    },

    // Create sample products using the addProduct step
    {
      step: 'addProduct',
      productTitle: 'Premium T-Shirt',
      productDescription: '<p>High-quality cotton t-shirt with modern design.</p><ul><li>100% Cotton</li><li>Machine washable</li><li>Available in multiple sizes</li></ul>',
      productPrice: '24.99',
      productSalePrice: '19.99',
      productSku: 'TSHIRT-001'
    },
    {
      step: 'addProduct',
      productTitle: 'WordPress Development Guide',
      productDescription: '<p>Complete guide to WordPress development with practical examples.</p><p>Perfect for beginners and intermediate developers.</p>',
      productPrice: '49.99',
      productSku: 'GUIDE-WP-2024'
    },
    {
      step: 'addProduct',
      productTitle: 'Coffee Mug',
      productDescription: '<p>Start your day with this beautiful ceramic mug.</p><p>Features:</p><ul><li>11oz capacity</li><li>Dishwasher safe</li><li>Custom WordPress design</li></ul>',
      productPrice: '15.99',
      productSku: 'MUG-WP-001'
    },
    {
      step: 'addProduct',
      productTitle: 'Laptop Sticker Pack',
      productDescription: '<p>Collection of 10 high-quality vinyl stickers perfect for laptops, phones, and more.</p>',
      productPrice: '12.99',
      productSalePrice: '9.99',
      productSku: 'STICKERS-PACK-01'
    },

    // Create essential WooCommerce pages
    {
      step: 'addPage',
      postTitle: 'Shop',
      postContent: '[woocommerce_shop]',
      homepage: false
    },
    {
      step: 'addPage',
      postTitle: 'Cart',
      postContent: '[woocommerce_cart]',
      homepage: false
    },
    {
      step: 'addPage',
      postTitle: 'Checkout',
      postContent: '[woocommerce_checkout]',
      homepage: false
    },
    {
      step: 'addPage',
      postTitle: 'My Account',
      postContent: '[woocommerce_my_account]',
      homepage: false
    },

    // Create informational pages
    {
      step: 'addPage',
      postTitle: 'About Our Store',
      postContent: '<h2>Welcome to Our Shop</h2><p>We offer high-quality products for WordPress developers and enthusiasts.</p><p>All our products are carefully selected to provide the best value for our customers.</p>',
      homepage: false
    },
    {
      step: 'addPage',
      postTitle: 'Shipping Info',
      postContent: '<h2>Shipping Information</h2><ul><li>Free shipping on orders over $50</li><li>Standard shipping: 5-7 business days</li><li>Express shipping available</li></ul>',
      homepage: false
    },
    {
      step: 'addPage',
      postTitle: 'Returns Policy',
      postContent: '<h2>Returns & Exchanges</h2><p>We offer 30-day returns on all products in original condition.</p><p>Contact us at returns@shop.com for return authorization.</p>',
      homepage: false
    }
  ]
};

console.log('🛒 Setting up WooCommerce shop with real products...');
console.log(`📦 Creating ${blueprint.steps.filter(s => s.step === 'addProduct').length} products`);
console.log(`📄 Creating ${blueprint.steps.filter(s => s.step === 'addPage').length} pages`);
console.log(`🔌 Installing WooCommerce plugin`);

const compiled = compiler.compile(blueprint);
console.log(`\n⚙️  Compiled ${blueprint.steps.length} custom steps to ${compiled.steps.length} native steps`);
console.log(compiled);
// Start WordPress Playground
const cliServer: RunCLIServer = await runCLI({
  command: 'server',
  wp: 'latest',
  login: true,
  blueprint: compiled,
});

console.log('\n🎉 WooCommerce shop setup complete!');
console.log('💡 Your shop now has:');
console.log('   • WooCommerce plugin installed');
console.log('   • 4 sample products with prices and descriptions');
console.log('   • Essential WooCommerce pages (Shop, Cart, Checkout, My Account)');
console.log('   • Shop manager user (shopmanager/shop123)');