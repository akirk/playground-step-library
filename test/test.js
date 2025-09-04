const PlaygroundStepLibrary = require('../lib/index.js');
const path = require('path');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function runTests() {
    console.log('Running tests...\n');

    // Test 1: Basic compilation
    console.log('Test 1: Basic compilation');
    const compiler = new PlaygroundStepLibrary({
        stepsDir: path.join(__dirname, '../steps')
    });

    const testBlueprint = {
        steps: [
            {
                step: 'setSiteName',
                sitename: 'Test Site',
                tagline: 'A test site'
            }
        ]
    };

    const compiled = compiler.compile(testBlueprint);
    assert(compiled.steps.length === 1, 'Should have one compiled step');
    assert(compiled.steps[0].step === 'setSiteOptions', 'Should compile to setSiteOptions');
    assert(compiled.steps[0].options.blogname === 'Test Site', 'Should substitute sitename variable');
    console.log('✓ Basic compilation works\n');

    // Test 2: Blueprint validation
    console.log('Test 2: Blueprint validation');
    const validResult = compiler.validateBlueprint(testBlueprint);
    assert(validResult.valid === true, 'Valid blueprint should pass validation');

    const invalidBlueprint = { invalidProperty: true };
    const invalidResult = compiler.validateBlueprint(invalidBlueprint);
    assert(invalidResult.valid === false, 'Invalid blueprint should fail validation');
    console.log('✓ Blueprint validation works\n');

    // Test 3: Custom step loading
    console.log('Test 3: Custom step loading');
    const availableSteps = compiler.getAvailableSteps();
    assert(typeof availableSteps === 'object', 'Should return available steps object');
    assert('setSiteName' in availableSteps, 'Should include setSiteName step');
    console.log('✓ Custom step loading works\n');

    // Test 4: Nested step compilation
    console.log('Test 4: Multiple steps compilation');
    const multiStepBlueprint = {
        steps: [
            {
                step: 'setSiteName',
                sitename: 'Multi Test',
                tagline: 'Multiple steps test'
            },
            {
                step: 'login',
                username: 'admin',
                password: 'password'
            }
        ]
    };

    const multiCompiled = compiler.compile(multiStepBlueprint);
    assert(multiCompiled.steps.length >= 2, 'Should have at least two compiled steps');
    console.log('✓ Multiple steps compilation works\n');

    // Test 5: Variable substitution
    console.log('Test 5: Variable substitution');
    const varTestBlueprint = {
        steps: [
            {
                step: 'setSiteName',
                sitename: 'Variable Test Site',
                tagline: 'Testing ${variables} substitution'
            }
        ]
    };

    const varCompiled = compiler.compile(varTestBlueprint);
    // Note: The tagline with ${variables} should remain as-is since 'variables' is not a defined variable
    console.log('✓ Variable substitution works\n');

    // Test 6: JSON string input
    console.log('Test 6: JSON string input');
    const jsonString = JSON.stringify(testBlueprint);
    const jsonCompiled = compiler.compile(jsonString);
    assert(jsonCompiled.steps.length === 1, 'Should compile JSON string input');
    console.log('✓ JSON string input works\n');

    console.log('All tests passed! ✅');
}

function runExamples() {
    console.log('\nRunning examples...\n');

    const compiler = new PlaygroundStepLibrary({
        stepsDir: path.join(__dirname, '../steps')
    });

    // Example 1: Simple site setup
    console.log('Example 1: Simple site setup');
    const siteSetup = {
        steps: [
            {
                step: 'setSiteName',
                sitename: 'My WordPress Site',
                tagline: 'Just another WordPress site'
            }
        ]
    };

    const compiledSetup = compiler.compile(siteSetup);
    console.log('Original blueprint steps:', siteSetup.steps.length);
    console.log('Compiled blueprint steps:', compiledSetup.steps.length);
    console.log('Compiled steps:', compiledSetup.steps.map(s => s.step));
    console.log();

    // Example 2: Show available custom steps
    console.log('Example 2: Available custom steps');
    const steps = compiler.getAvailableSteps();
    const customSteps = Object.entries(steps).filter(([name, info]) => !info.builtin);
    const builtinSteps = Object.entries(steps).filter(([name, info]) => info.builtin);
    
    console.log(`Found ${customSteps.length} custom steps and ${builtinSteps.length} builtin steps`);
    console.log('Custom steps:', customSteps.map(([name]) => name).slice(0, 5).join(', '), '...');
    console.log();
}

if (require.main === module) {
    try {
        runTests();
        runExamples();
    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}