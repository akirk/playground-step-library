const PlaygroundStepLibrary = require('../lib/index.js');
const path = require('path');

const compiler = new PlaygroundStepLibrary({
    stepsDir: path.join(__dirname, '../steps')
});

// Test with setSiteName only
console.log('Testing setSiteName only...');
const siteNameTest = {
    steps: [
        {
            step: 'setSiteName',
            sitename: 'Test Site',
            tagline: 'Test Tagline'
        }
    ]
};

try {
    const compiled = compiler.compile(siteNameTest);
    console.log('Success:', JSON.stringify(compiled, null, 2));
} catch (error) {
    console.error('Error:', error.message);
}

// Test with addPage only
console.log('\nTesting addPage only...');
const addPageTest = {
    steps: [
        {
            step: 'addPage',
            postTitle: 'Test Page',
            postContent: '<p>Test content</p>',
            homepage: false
        }
    ]
};

try {
    const compiled = compiler.compile(addPageTest);
    console.log('Success:', JSON.stringify(compiled, null, 2));
} catch (error) {
    console.error('Error:', error.message);
}