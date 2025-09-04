const PlaygroundStepLibrary = require('../lib/index.js');
const path = require('path');

const compiler = new PlaygroundStepLibrary({
    stepsDir: path.join(__dirname, '../steps')
});

console.log('Testing createProduct step:\n');

// Test: Full product with all options
const testProduct = {
    steps: [
        {
            step: 'createProduct',
            productTitle: 'Test Product',
            productDescription: 'This is a test product with all options',
            productPrice: '29.99',
            productSalePrice: '24.99',
            productSku: 'TEST-001',
            productStatus: 'publish'
        }
    ]
};

const compiled = compiler.compile(testProduct);
console.log('Generated PHP code:');
console.log('─'.repeat(50));
console.log(compiled.steps[0].code);
console.log('─'.repeat(50));

console.log('\n✅ createProduct step test completed!');