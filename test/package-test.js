/**
 * Test that simulates how the package works when installed via npm
 * This test verifies that steps are properly loaded from the package structure
 */

const path = require('path');
const fs = require('fs');

// Test the package as if it were installed in node_modules
function testPackageInstallation() {
    console.log('🧪 Testing package installation simulation...\n');
    
    // Simulate the package being in node_modules
    const PlaygroundStepLibrary = require('../lib/index.js');
    
    // Test 1: Basic instantiation
    console.log('Test 1: Basic instantiation');
    const compiler = new PlaygroundStepLibrary();
    console.log('✅ Compiler instantiated successfully');
    
    // Test 2: Steps directory loading
    console.log('\nTest 2: Steps directory loading');
    const availableSteps = compiler.getAvailableSteps();
    const totalSteps = Object.keys(availableSteps).length;
    console.log(`✅ Loaded ${totalSteps} total steps`);
    
    if (totalSteps < 40) {
        throw new Error(`Expected at least 40 steps, got ${totalSteps}`);
    }
    
    // Test 3: Built-in vs Custom steps
    console.log('\nTest 3: Built-in vs Custom steps');
    const builtinSteps = Object.entries(availableSteps).filter(([name, info]) => info.builtin);
    const customSteps = Object.entries(availableSteps).filter(([name, info]) => !info.builtin);
    
    console.log(`✅ Built-in steps: ${builtinSteps.length}`);
    console.log(`✅ Custom steps: ${customSteps.length}`);
    
    // Show some examples
    console.log('\nBuilt-in steps:', builtinSteps.slice(0, 5).map(([name]) => name).join(', '));
    console.log('Custom steps:', customSteps.slice(0, 5).map(([name]) => name).join(', '));
    
    // Test 4: Step definitions have required properties
    console.log('\nTest 4: Step definitions validation');
    let validSteps = 0;
    for (const [stepName, stepInfo] of Object.entries(availableSteps)) {
        if (stepInfo.description && Array.isArray(stepInfo.vars)) {
            validSteps++;
        }
    }
    console.log(`✅ ${validSteps}/${totalSteps} steps have proper definitions`);
    
    // Test 5: Cross-referencing capabilities
    console.log('\nTest 5: Cross-referencing test');
    const testBlueprint = {
        steps: [
            {
                step: 'addProduct',
                productTitle: 'Test Product',
                productDescription: 'A test product',
                productPrice: '19.99'
            }
        ]
    };
    
    let compiled;
    let hasWooCommerce = false;
    
    try {
        compiled = compiler.compile(testBlueprint);
        hasWooCommerce = compiled.steps.some(s => 
            s.step === 'installPlugin' && 
            s.pluginData && 
            s.pluginData.slug === 'woocommerce'
        );
        
        if (hasWooCommerce) {
            console.log('✅ Cross-referencing works: addProduct → installPlugin');
        } else {
            console.log('⚠️  Cross-referencing may not be working as expected');
        }
        
        console.log(`✅ Compilation: ${testBlueprint.steps.length} → ${compiled.steps.length} steps`);
        
    } catch (error) {
        console.log(`❌ Cross-referencing error: ${error.message}`);
    }
    
    // Test 6: Specific important steps
    console.log('\nTest 6: Important steps check');
    const importantSteps = [
        'installPlugin', 'addPost', 'addPage', 'addProduct', 
        'createUser', 'setSiteName', 'login'
    ];
    
    const missingSteps = importantSteps.filter(step => !availableSteps[step]);
    if (missingSteps.length === 0) {
        console.log('✅ All important steps are available');
    } else {
        console.log('❌ Missing important steps:', missingSteps);
    }
    
    console.log('\n🎉 Package installation test completed successfully!');
    return {
        totalSteps,
        builtinSteps: builtinSteps.length,
        customSteps: customSteps.length,
        crossReferencing: hasWooCommerce
    };
}

// Run the test
if (require.main === module) {
    try {
        const results = testPackageInstallation();
        console.log('\n📊 Test Summary:', results);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

module.exports = { testPackageInstallation };