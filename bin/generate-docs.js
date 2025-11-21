#!/usr/bin/env node

/**
 * Documentation Generator for WordPress Playground Steps
 * Automatically generates markdown documentation from step definitions
 */

import fs from 'fs';
import path from 'path';
import PlaygroundStepLibrary, { PlaygroundStepLibraryV2 } from '../lib/src/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class StepDocumentationGenerator {
    constructor() {
        this.compiler = new PlaygroundStepLibrary();
        this.compilerV2 = new PlaygroundStepLibraryV2();
        this.steps = this.compiler.getAvailableSteps();
        this.filesUpdated = 0;
        this.filesSkipped = 0;
    }

    /**
     * Write file only if content has changed
     */
    writeFileIfChanged(filepath, content) {
        let shouldWrite = true;

        if (fs.existsSync(filepath)) {
            const existingContent = fs.readFileSync(filepath, 'utf8');
            if (existingContent === content) {
                shouldWrite = false;
                this.filesSkipped++;
            }
        }

        if (shouldWrite) {
            fs.writeFileSync(filepath, content);
            this.filesUpdated++;
            console.log(`✅ Updated ${filepath}`);
        }
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
        this.writeFileIfChanged('docs/README.md', docs.readme);

        // Write steps list
        this.writeFileIfChanged('docs/steps-reference.md', docs.stepsList);

        // Write individual step docs
        Object.entries(docs.individualDocs).forEach(([stepName, content]) => {
            const filename = `docs/steps/${stepName}.md`;
            this.writeFileIfChanged(filename, content);
        });

        // Generate navigation index
        const navIndex = this.generateNavigationIndex();
        this.writeFileIfChanged('docs/steps/README.md', navIndex);

        // Generate reverse mapping (builtin steps -> custom steps)
        const reverseMapping = this.generateReverseMapping();
        this.writeFileIfChanged('docs/builtin-step-usage.md', reverseMapping);

        // Update main README with custom steps list
        this.updateMainReadmeWithSteps();

        console.log(`\n📊 Summary:`);
        console.log(`   ${this.filesUpdated} files updated`);
        console.log(`   ${this.filesSkipped} files unchanged`);
        console.log('\n🎉 Documentation generation complete!');

        return docs;
    }

    /**
     * Generate reverse mapping showing which custom steps generate each builtin step
     */
    generateReverseMapping() {
        const reverseIndex = {};

        Object.entries(this.steps).forEach(([stepName, stepInfo]) => {
            const compilationInfo = this.getCompilationInfo(stepName, stepInfo);

            if (compilationInfo.builtinSteps && compilationInfo.builtinSteps.length > 0) {
                compilationInfo.builtinSteps.forEach(builtinStep => {
                    if (!reverseIndex[builtinStep]) {
                        reverseIndex[builtinStep] = [];
                    }
                    reverseIndex[builtinStep].push({
                        name: stepName,
                        description: stepInfo.description || 'No description available',
                        builtin: stepInfo.builtin
                    });
                });
            }
        });

        const sortedBuiltins = Object.keys(reverseIndex).sort();

        let content = `# Built-in Step Usage Reference

This page shows which custom steps compile to each built-in WordPress Playground step.

## Step Types

- 🔧 **Built-in Step** - Core WordPress Playground steps enhanced with additional functionality
- ⚡ **Custom Step** - New steps that extend Playground beyond its core capabilities

## Table of Contents

${sortedBuiltins.map(step => `- [\`${step}\`](#${step.toLowerCase()})`).join('\n')}

---

`;

        sortedBuiltins.forEach(builtinStep => {
            const customSteps = reverseIndex[builtinStep].sort((a, b) => a.name.localeCompare(b.name));

            content += `## \`${builtinStep}\`

**Used by ${customSteps.length} step${customSteps.length === 1 ? '' : 's'}:**

`;

            customSteps.forEach(step => {
                const icon = step.builtin ? '🔧' : '⚡';
                content += `- ${icon} [\`${step.name}\`](steps/${step.name}.md) - ${step.description}\n`;
            });

            content += '\n---\n\n';
        });

        return content;
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
- [Built-in Step Usage](../builtin-step-usage.md) - See which steps compile to each built-in step
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
- [Built-in Step Usage](builtin-step-usage.md) - See which steps compile to each built-in step

## 🛠️ Contributing

See our [Contributing Guide](../CONTRIBUTING.md) for details on:

- Setting up your development environment
- Creating new steps
- Testing your changes
- Submitting pull requests
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
        const deprecationNotices = this.generateDeprecationNotices(stepInfo.vars || []);
        const compilationInfo = this.getCompilationInfo(stepName, stepInfo);

        return `# \`${stepName}\` Step

${stepInfo.description || 'No description available.'}

**[View Source](../../steps/${stepName}.ts)**

## Type
${stepInfo.builtin ? '🔧 **Built-in Step**' : '⚡ **Custom Step**'}
${compilationInfo.compilesToSteps}

## Parameters

${this.generateParametersTable(stepInfo.vars || [])}

## Examples

${examples}

${compilationInfo.compiledOutput}

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

${deprecationNotices}`;
    }

    /**
     * Get compilation information for a step
     */
    getCompilationInfo(stepName, stepInfo) {
        try {
            const example = { step: stepName };

            if (stepInfo.vars && stepInfo.vars.length > 0) {
                const activeVars = stepInfo.vars.filter(varDef => !varDef.deprecated);

                activeVars.forEach(varDef => {
                    if (varDef.samples && varDef.samples.length > 0) {
                        example[varDef.name] = varDef.samples[0];
                    } else {
                        example[varDef.name] = this.generateDefaultValue(varDef);
                    }
                });
            }

            // Compile v1
            const compiledV1 = this.compiler.compile({ steps: [example] });

            // Compile v2
            let compiledV2 = null;
            try {
                compiledV2 = this.compilerV2.compile({ steps: [example] });
            } catch (e) {
                // V2 compilation may fail for some steps
            }

            if (!compiledV1.steps || compiledV1.steps.length === 0) {
                return { compilesToSteps: '', compiledOutput: '' };
            }

            const builtinSteps = [...new Set(compiledV1.steps.map(s => s.step))];
            const compilesToSteps = builtinSteps.length > 0
                ? `\n**Compiles to:** ${builtinSteps.map(s => `[\`${s}\`](../builtin-step-usage.md#${s.toLowerCase()})`).join(', ')}`
                : '';

            const truncatedStepsV1 = compiledV1.steps.map(step => this.truncateStepValues(step));
            const formattedJsonV1 = JSON.stringify({ steps: truncatedStepsV1 }, null, 2);

            let compiledOutput = `## Compiled Output

### V1 (Imperative)

\`\`\`json
${formattedJsonV1}
\`\`\``;

            // Add V2 output if available
            if (compiledV2) {
                const truncatedV2 = this.truncateStepValues(compiledV2, 75);
                const formattedJsonV2 = JSON.stringify(truncatedV2, null, 2);

                compiledOutput += `

### V2 (Declarative)

\`\`\`json
${formattedJsonV2}
\`\`\``;
            }

            return { compilesToSteps, compiledOutput, builtinSteps };
        } catch (error) {
            console.error(`Error compiling ${stepName}:`, error.message);
            return { compilesToSteps: '', compiledOutput: '', builtinSteps: [] };
        }
    }

    /**
     * Generate compiled output for a step with truncated values
     */
    generateCompiledOutput(stepName, stepInfo) {
        try {
            const example = { step: stepName };

            if (stepInfo.vars && stepInfo.vars.length > 0) {
                const activeVars = stepInfo.vars.filter(varDef => !varDef.deprecated);

                activeVars.forEach(varDef => {
                    if (varDef.samples && varDef.samples.length > 0) {
                        example[varDef.name] = varDef.samples[0];
                    } else {
                        example[varDef.name] = this.generateDefaultValue(varDef);
                    }
                });
            }

            const compiled = this.compiler.compile({ steps: [example] });

            if (!compiled.steps || compiled.steps.length === 0) {
                return '';
            }

            const truncatedSteps = compiled.steps.map(step => this.truncateStepValues(step));
            const formattedJson = JSON.stringify({ steps: truncatedSteps }, null, 2);

            return `## Compiled Output

\`\`\`json
${formattedJson}
\`\`\``;
        } catch (error) {
            console.error(`Error compiling ${stepName}:`, error.message);
            return '';
        }
    }

    /**
     * Truncate long string values in a step object
     */
    truncateStepValues(step, maxLength = 75) {
        const truncated = {};

        for (const [key, value] of Object.entries(step)) {
            if (typeof value === 'string' && value.length > maxLength) {
                truncated[key] = value.substring(0, maxLength) + '...';
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                truncated[key] = this.truncateStepValues(value, maxLength);
            } else {
                truncated[key] = value;
            }
        }

        return truncated;
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

        // Filter out deprecated variables
        const activeVars = vars.filter(varDef => !varDef.deprecated);

        if (activeVars.length === 0) {
            return '*No parameters defined.*';
        }

        let table = `| Parameter | Type | Required | Description |\n|-----------|------|----------|-------------|\n`;

        activeVars.forEach(varDef => {
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
            // Filter out deprecated variables
            const activeVars = vars.filter(varDef => !varDef.deprecated);
            
            activeVars.forEach(varDef => {
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
     * Generate deprecation notices for deprecated variables
     */
    generateDeprecationNotices(vars) {
        if (!vars || vars.length === 0) {
            return '';
        }

        const deprecatedVars = vars.filter(varDef => varDef.deprecated);
        
        if (deprecatedVars.length === 0) {
            return '';
        }

        let notices = '## Deprecated Parameters\n\n';
        notices += 'The following parameters are deprecated but still supported for backward compatibility:\n\n';
        
        deprecatedVars.forEach(varDef => {
            // Try to match deprecated parameter with new one based on description
            const activeVar = vars.find(v => 
                !v.deprecated && 
                (v.description?.toLowerCase().includes(varDef.name?.replace('post', '').toLowerCase()) ||
                 varDef.description?.toLowerCase().includes(v.name?.toLowerCase()))
            );
            
            if (activeVar) {
                notices += `- \`${varDef.name}\` → Use \`${activeVar.name}\` instead\n`;
            } else {
                notices += `- \`${varDef.name}\` → Deprecated\n`;
            }
        });

        return notices + '\n';
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
        const activeVars = stepInfo.vars ? stepInfo.vars.filter(varDef => !varDef.deprecated) : [];
        if (activeVars.length > 3) {
            const advancedExample = { step: stepName };
            activeVars.forEach(varDef => {
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

    /**
     * Update the main README.md file with the list of custom steps
     */
    updateMainReadmeWithSteps() {
        const readmePath = 'README.md';

        if (!fs.existsSync(readmePath)) {
            console.log('⚠️  README.md not found, skipping update');
            return;
        }

        let readmeContent = fs.readFileSync(readmePath, 'utf8');

        // Generate the custom steps section
        const stepEntries = Object.entries(this.steps).sort(([a], [b]) => a.localeCompare(b));
        const builtinSteps = stepEntries.filter(([, info]) => info.builtin);
        const customSteps = stepEntries.filter(([, info]) => !info.builtin);

        const stepsSection = `
## Custom Steps

This library provides **${stepEntries.length}** total steps (${builtinSteps.length} built-in enhanced steps + ${customSteps.length} custom steps):

### Built-in Enhanced Steps
${builtinSteps.map(([name, info]) =>
            `- [\`${name}\`](docs/steps/${name}.md) - ${info.description || 'No description available'}`
        ).join('\n')}

### Custom Steps
${customSteps.map(([name, info]) =>
            `- [\`${name}\`](docs/steps/${name}.md) - ${info.description || 'No description available'}`
        ).join('\n')}`;

        // Remove all existing custom steps sections
        const customStepsRegex = /\n## Custom Steps[\s\S]*?(?=\n## [^C]|$)/g;
        readmeContent = readmeContent.replace(customStepsRegex, '');

        // Clean up any extra whitespace at the end
        readmeContent = readmeContent.trim();

        // Append the new custom steps section at the end
        readmeContent = readmeContent + stepsSection;

        this.writeFileIfChanged(readmePath, readmeContent);
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