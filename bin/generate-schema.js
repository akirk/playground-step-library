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

    for ( const [stepName, stepInfo] of Object.entries( steps ) ) {
        const varsProperties = {};
        const varsRequired = [];

        if ( stepInfo.vars && Array.isArray( stepInfo.vars ) ) {
            for ( const varDef of stepInfo.vars ) {
                if ( varDef.deprecated ) continue;

                const propSchema = {};

                // Map step library types to JSON schema types
                switch ( varDef.type ) {
                    case 'boolean':
                        propSchema.type = 'boolean';
                        break;
                    case 'number':
                        propSchema.type = 'number';
                        break;
                    default:
                        propSchema.type = 'string';
                        break;
                }

                if ( varDef.description ) {
                    propSchema.description = varDef.description;
                }

                varsProperties[varDef.name] = propSchema;

                if ( varDef.required ) {
                    varsRequired.push( varDef.name );
                }
            }
        }

        const stepSchema = {
            type: 'object',
            properties: {
                step: { const: stepName },
                vars: {
                    type: 'object',
                    properties: varsProperties,
                    required: varsRequired.length > 0 ? varsRequired : undefined,
                    additionalProperties: true
                }
            },
            required: ['step']
        };

        // Only add description if it exists
        if ( stepInfo.description ) {
            stepSchema.description = stepInfo.description;
        }

        stepDefinitions[stepName] = stepSchema;
    }

    // Build step references for oneOf
    const stepRefs = Object.keys( stepDefinitions ).map(
        name => ( { $ref: `#/definitions/${name}` } )
    );

    // Build the full schema
    const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'https://akirk.github.io/playground-step-library/step-library-schema.json',
        title: 'Step Library Blueprint',
        type: 'object',
        properties: {
            $schema: { type: 'string' },
            meta: {
                type: 'object',
                properties: {
                    title: { type: 'string' }
                }
            },
            title: { type: 'string' },
            preferredVersions: {
                type: 'object',
                properties: {
                    wp: { type: 'string' },
                    php: { type: 'string' }
                },
                additionalProperties: false
            },
            steps: {
                type: 'array',
                items: { oneOf: stepRefs }
            }
        },
        required: ['steps'],
        additionalProperties: false,
        definitions: stepDefinitions
    };

    return schema;
}

// Generate and write schema
const schema = generateSchema();
const outputPath = path.join(__dirname, '../step-library-schema.json');
fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
console.log('Generated step-library-schema.json with', Object.keys(schema.definitions).length, 'step definitions');
