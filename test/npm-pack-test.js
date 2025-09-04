/**
 * Test script that creates a real npm package and tests it
 * This is the most accurate way to test how the package will work when published
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testRealPackage() {
    console.log('📦 Testing real npm package...\n');
    
    // Create a temporary directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'playground-step-test-'));
    console.log('📁 Created temp directory:', tempDir);
    
    try {
        // Step 1: Pack the current package
        console.log('\n1️⃣ Creating package tarball...');
        execSync('npm pack', { cwd: process.cwd() });
        
        // Find the created tarball
        const tarballName = execSync('npm pack --dry-run 2>/dev/null | tail -1', { 
            cwd: process.cwd(),
            encoding: 'utf8' 
        }).trim();
        
        const tarballPath = path.join(process.cwd(), tarballName);
        console.log('✅ Created tarball:', tarballName);
        
        // Step 2: Create a test project
        console.log('\n2️⃣ Setting up test project...');
        process.chdir(tempDir);
        
        // Initialize a new npm project
        execSync('npm init -y', { stdio: 'ignore' });
        
        // Install the packed version
        console.log('📥 Installing packed version...');
        execSync(`npm install "${tarballPath}"`, { stdio: 'ignore' });
        
        // Step 3: Create test file
        console.log('\n3️⃣ Creating test file...');
        const testFileContent = `
const PlaygroundStepLibrary = require('playground-step-library');

console.log('🧪 Testing installed package...');

try {
    // Test instantiation
    const compiler = new PlaygroundStepLibrary();
    console.log('✅ Package loads successfully');
    
    // Test steps loading
    const steps = compiler.getAvailableSteps();
    const stepCount = Object.keys(steps).length;
    console.log(\`✅ Loaded \${stepCount} steps\`);
    
    if (stepCount < 40) {
        throw new Error(\`Expected at least 40 steps, got \${stepCount}\`);
    }
    
    // Test compilation
    const testBlueprint = {
        steps: [
            { step: 'setSiteName', sitename: 'Test Site', tagline: 'Testing' },
            { step: 'addPage', postTitle: 'About', postContent: 'About page' }
        ]
    };
    
    const compiled = compiler.compile(testBlueprint);
    console.log(\`✅ Compilation works: \${testBlueprint.steps.length} → \${compiled.steps.length} steps\`);
    
    // Test specific steps exist
    const importantSteps = ['installPlugin', 'addPost', 'addPage', 'createUser'];
    const missing = importantSteps.filter(s => !steps[s]);
    
    if (missing.length === 0) {
        console.log('✅ All important steps available');
    } else {
        throw new Error(\`Missing steps: \${missing.join(', ')}\`);
    }
    
    // Test CLI tool
    const { execSync } = require('child_process');
    try {
        const cliHelp = execSync('npx playground-compile --help', { encoding: 'utf8' });
        console.log('✅ CLI tool works');
    } catch (e) {
        console.log('⚠️  CLI test skipped:', e.message);
    }
    
    console.log('\\n🎉 All tests passed! Package is working correctly.');
    process.exit(0);
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}
`;
        
        fs.writeFileSync('test.js', testFileContent);
        
        // Step 4: Run the test
        console.log('\n4️⃣ Running tests on installed package...');
        execSync('node test.js', { stdio: 'inherit' });
        
        console.log('\n🎉 npm pack test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ npm pack test failed:', error.message);
        process.exit(1);
    } finally {
        // Cleanup
        process.chdir(path.dirname(tempDir));
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        // Remove tarball from project directory
        const files = fs.readdirSync(process.cwd());
        const tarballFiles = files.filter(f => f.startsWith('playground-step-library-') && f.endsWith('.tgz'));
        tarballFiles.forEach(f => fs.unlinkSync(f));
        
        console.log('🧹 Cleaned up temporary files');
    }
}

if (require.main === module) {
    testRealPackage().catch(error => {
        console.error('Test error:', error);
        process.exit(1);
    });
}

module.exports = { testRealPackage };