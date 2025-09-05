#!/usr/bin/env node

/**
 * Documentation Generator for WordPress Playground Steps
 * Automatically generates markdown documentation from step definitions
 */

import fs from 'fs';
import path from 'path';
import PlaygroundStepLibrary from '../lib/src/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class StepDocumentationGenerator {
    constructor() {
        this.compiler = new PlaygroundStepLibrary();
        this.steps = this.compiler.getAvailableSteps();
    }

    /**
     * Generate complete documentation
     */
    generateDocs() {
        console.log('📚 Generating step documentation...');
        
        const docs = {
            readme: this.generateMainReadme(),
            stepsList: this.generateStepsList(),
            individualDocs: this.generateIndividualStepDocs()
        };

        // Ensure docs directories exist
        if (!fs.existsSync('docs')) fs.mkdirSync('docs');
        if (!fs.existsSync('docs/steps')) fs.mkdirSync('docs/steps');

        // Write main steps documentation
        fs.writeFileSync('docs/README.md', docs.readme);
        console.log('✅ Generated docs/README.md');

        // Write steps list
        fs.writeFileSync('docs/steps-reference.md', docs.stepsList);
        console.log('✅ Generated docs/steps-reference.md');

        // Write individual step docs
        Object.entries(docs.individualDocs).forEach(([stepName, content]) => {
            const filename = `docs/steps/${stepName}.md`;
            fs.writeFileSync(filename, content);
        });

        // Generate navigation index
        const navIndex = this.generateNavigationIndex();
        fs.writeFileSync('docs/steps/README.md', navIndex);
        console.log('✅ Generated docs/steps/README.md (navigation index)');
        
        console.log(`✅ Generated ${Object.keys(docs.individualDocs).length} individual step docs`);
        console.log('\n🎉 Documentation generation complete!');

        return docs;
    }

    /**
     * Generate navigation index for the steps directory
     */
    generateNavigationIndex() {
        const stepEntries = Object.entries(this.steps).sort(([a], [b]) => a.localeCompare(b));
        const builtinSteps = stepEntries.filter(([, info]) => info.builtin);
        const customSteps = stepEntries.filter(([, info]) => !info.builtin);

        return `# Steps Documentation Index

Browse detailed documentation for each WordPress Playground step.

## 📊 Quick Stats
- **${stepEntries.length}** total steps
- **${builtinSteps.length}** built-in steps  
- **${customSteps.length}** custom steps

## 🔧 Built-in Steps
Enhanced core WordPress Playground steps with additional functionality.

${builtinSteps.map(([name, info]) => 
    `- [\`${name}\`](./${name}.md) - ${info.description || 'No description available'}`
).join('\n')}

## ⚡ Custom Steps
Extended functionality beyond core WordPress Playground capabilities.

${customSteps.map(([name, info]) => 
    `- [\`${name}\`](./${name}.md) - ${info.description || 'No description available'}`
).join('\n')}

## 📖 Other Documentation

- [← Back to Main Documentation](../README.md)
- [Complete Steps Reference](../steps-reference.md) - All steps in one page

---

*Documentation auto-generated on ${new Date().toISOString()}*
`;
    }

    /**
     * Generate main README with overview
     */
    generateMainReadme() {
        const stepEntries = Object.entries(this.steps);
        const builtinSteps = stepEntries.filter(([, info]) => info.builtin);
        const customSteps = stepEntries.filter(([, info]) => !info.builtin);

        return `# WordPress Playground Steps Documentation

This document provides comprehensive documentation for all available WordPress Playground custom steps.

## 📊 Overview

- **Total Steps**: ${stepEntries.length}
- **Built-in Steps**: ${builtinSteps.length}
- **Custom Steps**: ${customSteps.length}

## 🚀 Quick Start

\`\`\`javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
    {
      step: 'setSiteName',
      sitename: 'My WordPress Site',
      tagline: 'Powered by Playground'
    }
  ]
};

const compiled = compiler.compile(blueprint);
\`\`\`

## 📚 Step Categories

### Built-in Steps
Built-in steps are core WordPress Playground steps that are enhanced with additional functionality.

${builtinSteps.map(([name, info]) => 
  `- [\`${name}\`](steps/${name}.md) - ${info.description || 'No description available'}`
).join('\n')}

### Custom Steps  
Custom steps provide additional functionality beyond the core WordPress Playground capabilities.

${customSteps.map(([name, info]) => 
  `- [\`${name}\`](steps/${name}.md) - ${info.description || 'No description available'}`
).join('\n')}

## 🔗 Cross-References

Many steps can reference and use other steps. For example:
- \`addProduct\` automatically calls \`installPlugin\` to install WooCommerce
- \`importFriendFeeds\` calls \`installPlugin\` to install the Friends plugin

## 📖 Detailed Documentation

- [Complete Steps Reference](steps-reference.md) - Detailed list with all parameters
- [Individual Step Documentation](steps/) - Comprehensive docs for each step

## 🛠️ Contributing

To add a new step:

1. Create \`steps/yourStepName.js\`
2. Define the step function with proper metadata
3. Run \`npm run docs:generate\` to update documentation
4. Test your step with \`npm test\`

---

*This documentation is auto-generated from step definitions. Last updated: ${new Date().toISOString()}*
`;
    }

    /**
     * Generate detailed steps list
     */
    generateStepsList() {
        const stepEntries = Object.entries(this.steps).sort(([a], [b]) => a.localeCompare(b));

        let content = `# Complete Steps Reference

This document provides detailed information about all available steps, including their parameters, types, and usage examples.

## Table of Contents

${stepEntries.map(([name]) => `- [\`${name}\`](#${name.toLowerCase()})`).join('\n')}

---

`;

        stepEntries.forEach(([stepName, stepInfo]) => {
            content += this.generateStepSection(stepName, stepInfo) + '\n---\n\n';
        });

        content += `*Generated automatically from step definitions on ${new Date().toISOString()}*`;

        return content;
    }

    /**
     * Generate individual documentation files for each step
     */
    generateIndividualStepDocs() {
        const docs = {};
        
        // Ensure docs/steps directory exists
        if (!fs.existsSync('docs')) fs.mkdirSync('docs');
        if (!fs.existsSync('docs/steps')) fs.mkdirSync('docs/steps');

        Object.entries(this.steps).forEach(([stepName, stepInfo]) => {
            docs[stepName] = this.generateIndividualStepDoc(stepName, stepInfo);
        });

        return docs;
    }

    /**
     * Generate documentation for a single step
     */
    generateIndividualStepDoc(stepName, stepInfo) {
        const examples = this.generateStepExamples(stepName, stepInfo);
        
        return `# \`${stepName}\` Step

${stepInfo.description || 'No description available.'}

## Type
${stepInfo.builtin ? '🔧 **Built-in Step**' : '⚡ **Custom Step**'}

## Parameters

${this.generateParametersTable(stepInfo.vars || [])}

## Examples

${examples}

## Usage in Blueprint

\`\`\`json
{
  "steps": [
    ${this.generateJsonExample(stepName, stepInfo.vars || [])}
  ]
}
\`\`\`

## Usage with Library

\`\`\`javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
    ${this.generateJsonExample(stepName, stepInfo.vars || [])}
  ]
};

const compiled = compiler.compile(blueprint);
\`\`\`

---

*This documentation was auto-generated from the step definition.*
`;
    }

    /**
     * Generate a step section for the main list
     */
    generateStepSection(stepName, stepInfo) {
        return `## \`${stepName}\`

**Type**: ${stepInfo.builtin ? 'Built-in' : 'Custom'} Step  
**Description**: ${stepInfo.description || 'No description available'}

${this.generateParametersTable(stepInfo.vars || [])}

### Example Usage

\`\`\`json
${this.generateJsonExample(stepName, stepInfo.vars || [])}
\`\`\`

`;
    }

    /**
     * Generate parameters table
     */
    generateParametersTable(vars) {
        if (!vars || vars.length === 0) {
            return '*No parameters defined.*';
        }

        let table = `| Parameter | Type | Required | Description |\n|-----------|------|----------|-------------|\n`;
        
        vars.forEach(varDef => {
            const name = varDef.name || 'unknown';
            const type = varDef.type || 'string';
            const required = varDef.required ? '✅ Yes' : '❌ No';
            const description = varDef.description || 'No description';
            
            table += `| \`${name}\` | ${type} | ${required} | ${description} |\n`;
        });

        return table;
    }

    /**
     * Generate JSON example for a step
     */
    generateJsonExample(stepName, vars) {
        const example = { step: stepName };
        
        if (vars && vars.length > 0) {
            vars.forEach(varDef => {
                if (varDef.samples && varDef.samples.length > 0) {
                    example[varDef.name] = varDef.samples[0];
                } else {
                    // Generate sensible defaults based on type and name
                    example[varDef.name] = this.generateDefaultValue(varDef);
                }
            });
        }

        return JSON.stringify(example, null, 6).replace(/^/gm, '    ');
    }

    /**
     * Generate sensible default values for examples
     */
    generateDefaultValue(varDef) {
        const name = (varDef.name || '').toLowerCase();
        const type = varDef.type || 'string';

        if (type === 'boolean') return false;
        if (type === 'number') return 0;
        
        // String defaults based on common patterns
        if (name.includes('title')) return 'Example Title';
        if (name.includes('content')) return 'Example content goes here';
        if (name.includes('name')) return 'example-name';
        if (name.includes('email')) return 'user@example.com';
        if (name.includes('url')) return 'https://example.com';
        if (name.includes('path')) return '/example/path';
        if (name.includes('code')) return '<?php echo "Hello World"; ?>';
        if (name.includes('password')) return 'password123';
        if (name.includes('username')) return 'user';
        
        return 'example-value';
    }

    /**
     * Generate usage examples for a step
     */
    generateStepExamples(stepName, stepInfo) {
        const examples = [];
        
        // Basic example
        examples.push(`### Basic Usage
\`\`\`json
${this.generateJsonExample(stepName, stepInfo.vars || [])}
\`\`\``);

        // Advanced example if step has multiple parameters
        if (stepInfo.vars && stepInfo.vars.length > 3) {
            const advancedExample = { step: stepName };
            stepInfo.vars.forEach(varDef => {
                if (varDef.samples && varDef.samples.length > 1) {
                    advancedExample[varDef.name] = varDef.samples[1];
                } else if (varDef.samples && varDef.samples.length > 0) {
                    advancedExample[varDef.name] = varDef.samples[0];
                } else {
                    advancedExample[varDef.name] = this.generateDefaultValue(varDef);
                }
            });

            examples.push(`### Advanced Usage
\`\`\`json
${JSON.stringify(advancedExample, null, 2)}
\`\`\``);
        }

        return examples.join('\n\n');
    }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        const generator = new StepDocumentationGenerator();
        generator.generateDocs();
    } catch (error) {
        console.error('❌ Documentation generation failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

export default StepDocumentationGenerator;