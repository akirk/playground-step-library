import { describe, it, expect } from 'vitest';
import PlaygroundStepLibrary from '../lib/src/index.js';

describe('PlaygroundStepLibrary', () => {
  let compiler;

  beforeEach(() => {
    compiler = new PlaygroundStepLibrary();
  });

  describe('Basic functionality', () => {
    it('should instantiate without errors', () => {
      expect(compiler).toBeInstanceOf(PlaygroundStepLibrary);
    });

    it('should load steps', () => {
      const steps = compiler.getAvailableSteps();
      expect(Object.keys(steps).length).toBeGreaterThan(0);
      expect(typeof steps).toBe('object');
    });

    it('should have both builtin and custom steps', () => {
      const steps = compiler.getAvailableSteps();
      const builtinSteps = Object.values(steps).filter(step => step.builtin).length;
      const customSteps = Object.values(steps).filter(step => !step.builtin).length;

      expect(builtinSteps).toBeGreaterThan(0);
      expect(customSteps).toBeGreaterThan(0);
      expect(builtinSteps + customSteps).toBe(Object.keys(steps).length);
    });
  });

  describe('Blueprint compilation', () => {
    it('should compile a simple blueprint', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'Test Site',
              tagline: 'A test site'
            }
          }
        ]
      };

      const compiled = compiler.compile(blueprint);
      expect(compiled.steps).toHaveLength(1);
      expect(compiled.steps[0].step).toBe('setSiteOptions');
      expect(compiled.steps[0].options.blogname).toBe('Test Site');
    });

    it('should preserve landingPage property', () => {
      const blueprint = {
        landingPage: '/custom-landing',
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'Landing Page Test',
              tagline: 'Testing landingPage preservation'
            }
          }
        ]
      };

      const compiled = compiler.compile(blueprint);
      expect(compiled.landingPage).toBe('/custom-landing');
    });

    it('should handle multiple steps', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'Multi Test',
              tagline: 'Multiple steps test'
            }
          },
          {
            step: 'login',
            vars: {
              username: 'admin',
              password: 'password'
            }
          }
        ]
      };

      const compiled = compiler.compile(blueprint);
      expect(compiled.steps.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle JSON string input', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'JSON Test',
              tagline: 'JSON string test'
            }
          }
        ]
      };

      const jsonString = JSON.stringify(blueprint);
      const compiled = compiler.compile(jsonString);
      expect(compiled.steps).toHaveLength(1);
    });

    it('should extract queryParams from steps and store them separately', () => {
      const blueprint = {
        steps: [
          {
            step: 'installPlugin',
            vars: {
              url: 'https://github.com/akirk/friends/pull/559',
              prs: true
            }
          }
        ]
      };

      const compiled = compiler.compile(blueprint);

      // queryParams should be removed from the compiled steps
      expect(compiled.steps).toHaveLength(1);
      expect(compiled.steps[0].queryParams).toBeUndefined();

      // But they should be accessible via getLastQueryParams()
      const queryParams = compiler.getLastQueryParams();
      expect(queryParams['gh-ensure-auth']).toBe('yes');
      expect(queryParams['ghexport-repo-url']).toBe('https://github.com/akirk/friends');
      expect(queryParams['ghexport-plugin']).toBe('friends');
      expect(queryParams['ghexport-playground-root']).toBe('/wordpress/wp-content/plugins/friends');
      expect(queryParams['ghexport-pr-action']).toBe('create');
      expect(queryParams['ghexport-allow-include-zip']).toBe('no');
    });
  });

  describe('Blueprint validation', () => {
    it('should validate a valid blueprint', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'Test Site',
              tagline: 'A test site'
            }
          }
        ]
      };

      const result = compiler.validateBlueprint(blueprint);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid blueprints', () => {
      const invalidBlueprint = { invalidProperty: true };
      const result = compiler.validateBlueprint(invalidBlueprint);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate JSON string blueprints', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'Test Site',
              tagline: 'A test site'
            }
          }
        ]
      };

      const result = compiler.validateBlueprint(JSON.stringify(blueprint));
      expect(result.valid).toBe(true);
    });
  });

  describe('preferredVersions handling', () => {
    it('should preserve preferredVersions with wp and php when provided', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'Version Test',
              tagline: 'Testing version preservation'
            }
          }
        ]
      };

      const options = {
        preferredVersions: {
          wp: '6.4',
          php: '8.2'
        }
      };

      const compiled = compiler.compile(blueprint, options);
      expect(compiled.preferredVersions).toBeDefined();
      expect(compiled.preferredVersions.wp).toBe('6.4');
      expect(compiled.preferredVersions.php).toBe('8.2');
    });

    it('should preserve preferredVersions with only wp version', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'WP Version Test',
              tagline: 'Testing WP version only'
            }
          }
        ]
      };

      const options = {
        preferredVersions: {
          wp: '6.3'
        }
      };

      const compiled = compiler.compile(blueprint, options);
      expect(compiled.preferredVersions).toBeDefined();
      expect(compiled.preferredVersions.wp).toBe('6.3');
      expect(compiled.preferredVersions.php).toBe('latest');
    });

    it('should preserve preferredVersions with only php version', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'PHP Version Test',
              tagline: 'Testing PHP version only'
            }
          }
        ]
      };

      const options = {
        preferredVersions: {
          php: '8.1'
        }
      };

      const compiled = compiler.compile(blueprint, options);
      expect(compiled.preferredVersions).toBeDefined();
      expect(compiled.preferredVersions.php).toBe('8.1');
      expect(compiled.preferredVersions.wp).toBe('latest');
    });

    it('should omit preferredVersions when both are latest', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'Latest Version Test',
              tagline: 'Testing latest versions'
            }
          }
        ]
      };

      const options = {
        preferredVersions: {
          wp: 'latest',
          php: 'latest'
        }
      };

      const compiled = compiler.compile(blueprint, options);
      expect(compiled.preferredVersions).toBeUndefined();
    });

    it('should handle blueprint without preferredVersions', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'No Version Test',
              tagline: 'Testing without versions'
            }
          }
        ]
      };

      const compiled = compiler.compile(blueprint);
      expect(compiled.preferredVersions).toBeUndefined();
    });

    it('should set php to latest when only wp is specified in options', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'WP Only Test'
            }
          }
        ]
      };

      const options = {
        preferredVersions: {
          wp: '6.4'
        }
      };

      const compiled = compiler.compile(blueprint, options);
      expect(compiled.preferredVersions).toBeDefined();
      expect(compiled.preferredVersions.wp).toBe('6.4');
      expect(compiled.preferredVersions.php).toBe('latest');
    });

    it('should set wp to latest when only php is specified in options', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            vars: {
              sitename: 'PHP Only Test'
            }
          }
        ]
      };

      const options = {
        preferredVersions: {
          php: '8.2'
        }
      };

      const compiled = compiler.compile(blueprint, options);
      expect(compiled.preferredVersions).toBeDefined();
      expect(compiled.preferredVersions.php).toBe('8.2');
      expect(compiled.preferredVersions.wp).toBe('latest');
    });
  });
});
