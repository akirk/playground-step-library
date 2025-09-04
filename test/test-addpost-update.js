const PlaygroundStepLibrary = require('../lib/index.js');
const path = require('path');

const compiler = new PlaygroundStepLibrary({
    stepsDir: path.join(__dirname, '../steps')
});

console.log('Testing updated addPost step:\n');

// Test 1: With postDate and postStatus
console.log('Test 1: With postDate and postStatus');
const testWithDateAndStatus = {
    steps: [
        {
            step: 'addPost',
            postTitle: 'Test Post',
            postContent: 'This is a test post',
            postType: 'post',
            postDate: '2024-01-01 10:00:00',
            postStatus: 'draft'
        }
    ]
};

const compiled1 = compiler.compile(testWithDateAndStatus);
console.log(compiled1.steps[0].code);

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Without postDate (should be omitted)
console.log('Test 2: Without postDate (should be omitted)');
const testWithoutDate = {
    steps: [
        {
            step: 'addPost',
            postTitle: 'Test Post 2',
            postContent: 'This post has no date',
            postType: 'post',
            postStatus: 'publish'
        }
    ]
};

const compiled2 = compiler.compile(testWithoutDate);
console.log(compiled2.steps[0].code);

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Minimal (only required fields, should use default publish status)
console.log('Test 3: Minimal (only required fields)');
const testMinimal = {
    steps: [
        {
            step: 'addPost',
            postTitle: 'Minimal Post',
            postContent: 'Just the basics',
            postType: 'post'
        }
    ]
};

const compiled3 = compiler.compile(testMinimal);
console.log(compiled3.steps[0].code);

console.log('\n✅ All tests completed!');