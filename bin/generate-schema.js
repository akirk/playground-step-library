#!/usr/bin/env node

/**
 * Generate JSON Schema for Step Library Blueprint format
 * Infers schema from the steps registry
 */

import fs from 'fs';
import path from 'path';
import PlaygroundStepLibrary from '../lib/src/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateSchema() {
    const compiler = new PlaygroundStepLibrary();
    const steps = compiler.getAvailableSteps();

    // Build step definitions from registry
    const stepDefinitions = {};

    for (const [stepName, stepInfo] of Object.entries(steps)) {
        const properties = {
            step: {
                type: 'string',
                const: stepName,
                description: stepInfo.description || `The ${stepName} step`
            }
        };

        const requiredProps = ['step'];
        const varsProperties = {};
        const varsRequired = [];

        if (stepInfo.vars && Array.isArray(stepInfo.vars)) {
            for (const varDef of stepInfo.vars) {
                if (varDef.deprecated) continue;

                const propSchema = {
                    description: varDef.description || ''
                };

                // Map step library types to JSON schema types
                switch (varDef.type) {
                    case 'boolean':
                        propSchema.type = 'boolean';
                        break;
                    case 'number':
                        propSchema.type = 'number';
                        break;
                    case 'textarea':
                    case 'text':
                    case 'url':
                    case 'select':
                    default:
                        propSchema.type = 'string';
                        break;
                }

                // Add to both flat and vars format
                properties[varDef.name] = { ...propSchema };
                varsProperties[varDef.name] = { ...propSchema };

                if (varDef.required) {
                    varsRequired.push(varDef.name);
                }
            }
        }

        // Build the step schema with support for both flat and vars formats
        const stepSchema = {
            type: 'object',
            description: stepInfo.description || '',
            properties: {
                ...properties,
                vars: {
                    type: 'object',
                    description: 'Step parameters (nested format)',
                    properties: varsProperties,
                    additionalProperties: true
                }
            },
            required: requiredProps,
            additionalProperties: true
        };

        stepDefinitions[stepName] = stepSchema;
    }

    // Build the full schema
    const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'https://akirk.github.io/playground-step-library/step-library-schema.json',
        title: 'Step Library Blueprint',
        description: 'A blueprint format for WordPress Playground Step Library with custom steps',
        type: 'object',
        properties: {
            $schema: {
                type: 'string',
                description: 'JSON Schema reference'
            },
            meta: {
                type: 'object',
                description: 'Blueprint metadata',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Title of the blueprint'
                    }
                },
                additionalProperties: true
            },
            title: {
                type: 'string',
                description: 'Title of the blueprint (alternative to meta.title)'
            },
            landingPage: {
                type: 'string',
                description: 'The page to navigate to after setup'
            },
            preferredVersions: {
                type: 'object',
                description: 'Preferred WordPress and PHP versions',
                properties: {
                    wp: {
                        type: 'string',
                        description: 'WordPress version'
                    },
                    php: {
                        type: 'string',
                        description: 'PHP version'
                    }
                },
                additionalProperties: false
            },
            steps: {
                type: 'array',
                description: 'Array of steps to execute',
                items: {
                    oneOf: Object.values(stepDefinitions)
                }
            }
        },
        required: ['steps'],
        additionalProperties: true,
        definitions: stepDefinitions
    };

    return schema;
}

// Generate and write schema
const schema = generateSchema();
const outputPath = path.join(__dirname, '../step-library-schema.json');
fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
console.log('Generated step-library-schema.json with', Object.keys(schema.definitions).length, 'step definitions');
