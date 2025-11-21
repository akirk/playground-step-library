import { setLandingPage } from './setLandingPage.js';
import type { SetLandingPageStep } from './types.js';
import PlaygroundStepLibrary from '../src/index.js';

describe('setLandingPage', () => {
    describe('toV1()', () => {
        it('should return empty steps with landingPage property', () => {
            const step: SetLandingPageStep = {
                step: 'setLandingPage',
                landingPage: '/wp-admin/post-new.php'
            };

            const result = setLandingPage(step).toV1();

            expect(Array.isArray(result.steps)).toBe(true);
            expect(result.steps).toHaveLength(0);
            expect(result.landingPage).toBe('/wp-admin/post-new.php');
        });

        it('should work with root path', () => {
            const step: SetLandingPageStep = {
                step: 'setLandingPage',
                landingPage: '/'
            };

            const result = setLandingPage(step).toV1();

            expect(result.landingPage).toBe('/');
        });

        it('should work with admin paths', () => {
            const step: SetLandingPageStep = {
                step: 'setLandingPage',
                landingPage: '/wp-admin/'
            };

            const result = setLandingPage(step).toV1();

            expect(result.landingPage).toBe('/wp-admin/');
        });

        it('should work with complex admin paths', () => {
            const step: SetLandingPageStep = {
                step: 'setLandingPage',
                landingPage: '/wp-admin/post-new.php?post_type=page'
            };

            const result = setLandingPage(step).toV1();

            expect(result.landingPage).toBe('/wp-admin/post-new.php?post_type=page');
        });

        it('should preserve input value exactly', () => {
            const testPaths = [
                '/custom-page/',
                '/wp-admin/edit.php',
                '/wp-admin/themes.php',
                '/wp-admin/plugins.php?activate=true'
            ];

            testPaths.forEach(path => {
                const step: SetLandingPageStep = {
                    step: 'setLandingPage',
                    landingPage: path
                };

                const result = setLandingPage(step).toV1();
                expect(result.landingPage).toBe(path);
            });
        });
    });

    it('should have correct metadata', () => {
        expect(setLandingPage.description).toBe('Set the landing page.');
        expect(Array.isArray(setLandingPage.vars)).toBe(true);
        expect(setLandingPage.vars).toHaveLength(1);

        const landingPageVar = setLandingPage.vars.find(v => v.name === 'landingPage');
        expect(landingPageVar).toBeDefined();
        expect(landingPageVar.description).toBe('The relative URL for the landing page');
        expect(landingPageVar.required).toBe(true);
        expect(landingPageVar.samples).toEqual([
            '/',
            '/wp-admin/',
            '/wp-admin/post-new.php',
            '/wp-admin/post-new.php?post_type=page'
        ]);
    });

    describe('Integration tests', () => {
        let compiler: PlaygroundStepLibrary;

        beforeEach(() => {
            compiler = new PlaygroundStepLibrary();
        });

        it('should compile setLandingPage step to blueprint-level property', () => {
            const blueprint = {
                steps: [
                    {
                        step: 'setLandingPage',
                        landingPage: '/wp-admin/post-new.php'
                    }
                ]
            };

            const compiled = compiler.compile(blueprint);
            expect(compiled.landingPage).toBe('/wp-admin/post-new.php');
            expect(compiled.steps).toBeUndefined(); // Empty steps array should be removed
        });

        it('should handle default landing page cleanup', () => {
            const blueprint = {
                steps: [
                    {
                        step: 'setLandingPage',
                        landingPage: '/'
                    }
                ]
            };

            const compiled = compiler.compile(blueprint);
            expect(compiled.landingPage).toBeUndefined(); // Default landing page should be cleaned up
            expect(compiled.steps).toBeUndefined();
        });

        it('should work with other steps in the same blueprint', () => {
            const blueprint = {
                steps: [
                    {
                        step: 'setSiteName',
                        sitename: 'Test Site',
                        tagline: 'Test tagline'
                    },
                    {
                        step: 'setLandingPage',
                        landingPage: '/wp-admin/themes.php'
                    }
                ]
            };

            const compiled = compiler.compile(blueprint);
            expect(compiled.landingPage).toBe('/wp-admin/themes.php');
            expect(compiled.steps).toHaveLength(1); // setSiteName step should remain
            expect(compiled.steps[0].step).toBe('setSiteOptions');
        });

        it('should validate setLandingPage step requirements', () => {
            const invalidBlueprint = {
                steps: [
                    {
                        step: 'setLandingPage'
                        // Missing required landingPage property
                    }
                ]
            };

            const result = compiler.validateBlueprint(invalidBlueprint);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('missing required variable: landingPage');
        });

        it('should validate setLandingPage step with valid input', () => {
            const validBlueprint = {
                steps: [
                    {
                        step: 'setLandingPage',
                        landingPage: '/wp-admin/post-new.php'
                    }
                ]
            };

            const result = compiler.validateBlueprint(validBlueprint);
            expect(result.valid).toBe(true);
        });
    });
});