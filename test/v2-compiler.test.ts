import { describe, it, expect } from 'vitest';
import PlaygroundStepLibrary from '../src/index.js';

describe('compileV2', () => {
    describe('Basic functionality', () => {
        it('should compile a simple addPage step to v2 format', () => {
            const compiler = new PlaygroundStepLibrary();
            const blueprint = {
                steps: [
                    {
                        step: 'addPage',
                        title: 'About Us',
                        content: '<p>Company information</p>'
                    }
                ]
            };

            const result = compiler.compileV2(blueprint);

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
            const compiler = new PlaygroundStepLibrary();
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

            const result = compiler.compileV2(blueprint);

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
            const compiler = new PlaygroundStepLibrary();
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

            const result = compiler.compileV2(blueprint);

            // Should have merged content array
            expect(result.content).toBeDefined();
            expect(result.content).toHaveLength(2);
            expect(result.content[0].source.post_title).toBe('About');
            expect(result.content[1].source.post_title).toBe('Contact');
        });

        it('should handle steps that return old format (array)', () => {
            const compiler = new PlaygroundStepLibrary();
            const blueprint = {
                steps: [
                    {
                        step: 'runPHP',
                        code: '<?php echo "test"; ?>'
                    }
                ]
            };

            const result = compiler.compileV2(blueprint);

            // Old format steps should go to additionalStepsAfterExecution
            expect(result.additionalStepsAfterExecution).toBeDefined();
            expect(result.additionalStepsAfterExecution).toHaveLength(1);
            expect(result.additionalStepsAfterExecution[0].step).toBe('runPHP');
        });

        it('should preserve meta and title', () => {
            const compiler = new PlaygroundStepLibrary();
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

            const result = compiler.compileV2(blueprint);

            expect(result.blueprintMeta).toBeDefined();
            expect(result.blueprintMeta!.name).toBe('My Blueprint');
        });

        it('should handle landingPage from input blueprint', () => {
            const compiler = new PlaygroundStepLibrary();
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

            const result = compiler.compileV2(blueprint);

            expect(result.applicationOptions?.['wordpress-playground']?.landingPage).toBe('/about');
        });

        it('should omit default landingPage', () => {
            const compiler = new PlaygroundStepLibrary();
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

            const result = compiler.compileV2(blueprint);

            expect(result.applicationOptions?.['wordpress-playground']?.landingPage).toBeUndefined();
        });

        it('should handle setLandingPage step', () => {
            const compiler = new PlaygroundStepLibrary();
            const blueprint = {
                steps: [
                    {
                        step: 'setLandingPage',
                        landingPage: '/wp-admin/themes.php'
                    }
                ]
            };

            const result = compiler.compileV2(blueprint);

            expect(result.applicationOptions).toBeDefined();
            expect(result.applicationOptions['wordpress-playground'].landingPage).toBe('/wp-admin/themes.php');
        });

        it('should handle dontLogin step', () => {
            const compiler = new PlaygroundStepLibrary();
            const blueprint = {
                steps: [
                    {
                        step: 'dontLogin'
                    }
                ]
            };

            const result = compiler.compileV2(blueprint);

            expect(result.applicationOptions).toBeDefined();
            expect(result.applicationOptions['wordpress-playground'].login).toBe(false);
        });

        it('should convert preferredVersions to wordpressVersion and phpVersion', () => {
            const compiler = new PlaygroundStepLibrary();
            const blueprint = {
                steps: [
                    {
                        step: 'addPage',
                        title: 'Test',
                        content: '<p>Test</p>'
                    }
                ]
            };

            const result = compiler.compileV2(blueprint, {
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
            const compiler = new PlaygroundStepLibrary();
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
            const compiler = new PlaygroundStepLibrary();
            const blueprint = {};

            const validation = compiler.validateBlueprint(blueprint as any);
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('steps array');
        });

        it('should handle JSON string input', () => {
            const compiler = new PlaygroundStepLibrary();
            const blueprintStr = JSON.stringify({
                steps: [
                    {
                        step: 'addPage',
                        title: 'Test',
                        content: '<p>Test</p>'
                    }
                ]
            });

            const result = compiler.compileV2(blueprintStr);
            expect(result.content).toBeDefined();
            expect(result.content).toHaveLength(1);
        });
    });
});
