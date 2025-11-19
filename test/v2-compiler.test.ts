import { describe, it, expect } from 'vitest';
import PlaygroundStepLibraryV2 from '../src/v2-compiler.js';

describe('PlaygroundStepLibraryV2', () => {
    describe('Basic functionality', () => {
        it('should instantiate without errors', () => {
            const compiler = new PlaygroundStepLibraryV2();
            expect(compiler).toBeDefined();
        });

        it('should compile a simple addPage step to v2 format', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                steps: [
                    {
                        step: 'addPage',
                        title: 'About Us',
                        content: '<p>Company information</p>'
                    }
                ]
            };

            const result = compiler.compile(blueprint);

            // Should have content array
            expect(result.content).toBeDefined();
            expect(result.content).toHaveLength(1);
            expect(result.content[0]).toEqual({
                type: 'posts',
                source: {
                    post_title: 'About Us',
                    post_content: '<p>Company information</p>',
                    post_type: 'page',
                    post_status: 'publish'
                }
            });

            // Should not have old steps array
            expect(result.steps).toBeUndefined();
        });

        it('should compile addPage with homepage flag', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                steps: [
                    {
                        step: 'addPage',
                        title: 'Home',
                        content: '<p>Welcome</p>',
                        homepage: true
                    }
                ]
            };

            const result = compiler.compile(blueprint);

            // Should have content array
            expect(result.content).toBeDefined();
            expect(result.content).toHaveLength(1);

            // Should have siteOptions
            expect(result.siteOptions).toBeDefined();
            expect(result.siteOptions.show_on_front).toBe('page');

            // Should have additionalSteps for setting page_on_front
            expect(result.additionalStepsAfterExecution).toBeDefined();
            expect(result.additionalStepsAfterExecution).toHaveLength(1);
            expect(result.additionalStepsAfterExecution[0].step).toBe('runPHP');
        });

        it('should merge multiple addPage steps', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                steps: [
                    {
                        step: 'addPage',
                        title: 'About',
                        content: '<p>About us</p>'
                    },
                    {
                        step: 'addPage',
                        title: 'Contact',
                        content: '<p>Contact us</p>'
                    }
                ]
            };

            const result = compiler.compile(blueprint);

            // Should have merged content array
            expect(result.content).toBeDefined();
            expect(result.content).toHaveLength(2);
            expect(result.content[0].source.post_title).toBe('About');
            expect(result.content[1].source.post_title).toBe('Contact');
        });

        it('should handle steps that return old format (array)', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                steps: [
                    {
                        step: 'runPHP',
                        code: '<?php echo "test"; ?>'
                    }
                ]
            };

            const result = compiler.compile(blueprint);

            // Old format steps should go to additionalStepsAfterExecution
            expect(result.additionalStepsAfterExecution).toBeDefined();
            expect(result.additionalStepsAfterExecution).toHaveLength(1);
            expect(result.additionalStepsAfterExecution[0].step).toBe('runPHP');
        });

        it('should preserve meta and title', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                title: 'My Blueprint',
                steps: [
                    {
                        step: 'addPage',
                        title: 'Test',
                        content: '<p>Test</p>'
                    }
                ]
            };

            const result = compiler.compile(blueprint);

            expect(result.meta).toBeDefined();
            expect(result.meta.title).toBe('My Blueprint');
        });

        it('should handle landingPage', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                landingPage: '/about',
                steps: [
                    {
                        step: 'addPage',
                        title: 'About',
                        content: '<p>About</p>'
                    }
                ]
            };

            const result = compiler.compile(blueprint);

            expect(result.landingPage).toBe('/about');
        });

        it('should omit default landingPage', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                landingPage: '/',
                steps: [
                    {
                        step: 'addPage',
                        title: 'Test',
                        content: '<p>Test</p>'
                    }
                ]
            };

            const result = compiler.compile(blueprint);

            expect(result.landingPage).toBeUndefined();
        });

        it('should convert preferredVersions to wordpressVersion and phpVersion', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                steps: [
                    {
                        step: 'addPage',
                        title: 'Test',
                        content: '<p>Test</p>'
                    }
                ]
            };

            const result = compiler.compile(blueprint, {
                preferredVersions: {
                    wp: '6.4',
                    php: '8.2'
                }
            });

            expect(result.wordpressVersion).toBe('6.4');
            expect(result.phpVersion).toBe('8.2');
            expect(result.preferredVersions).toBeUndefined();
        });
    });

    describe('Validation', () => {
        it('should validate a valid blueprint', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {
                steps: [
                    {
                        step: 'addPage',
                        title: 'Test',
                        content: '<p>Test</p>'
                    }
                ]
            };

            const validation = compiler.validateBlueprint(blueprint);
            expect(validation.valid).toBe(true);
            expect(validation.error).toBeUndefined();
        });

        it('should reject blueprint without steps', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprint = {};

            const validation = compiler.validateBlueprint(blueprint as any);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('steps array');
        });

        it('should handle JSON string input', () => {
            const compiler = new PlaygroundStepLibraryV2();
            const blueprintStr = JSON.stringify({
                steps: [
                    {
                        step: 'addPage',
                        title: 'Test',
                        content: '<p>Test</p>'
                    }
                ]
            });

            const result = compiler.compile(blueprintStr);
            expect(result.content).toBeDefined();
            expect(result.content).toHaveLength(1);
        });
    });
});
