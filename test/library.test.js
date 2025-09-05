import { describe, it, expect } from 'vitest';
import PlaygroundStepLibrary from '../lib/index.js';

describe('PlaygroundStepLibrary', () => {
  let compiler;
  
  beforeEach(() => {
    compiler = new PlaygroundStepLibrary();
  });

  describe('Basic functionality', () => {
    it('should instantiate without errors', () => {
      expect(compiler).toBeInstanceOf(PlaygroundStepLibrary);
    });

    it('should load all steps', () => {
      const steps = compiler.getAvailableSteps();
      expect(Object.keys(steps)).toHaveLength(44);
    });

    it('should have both builtin and custom steps', () => {
      const steps = compiler.getAvailableSteps();
      const builtinSteps = Object.values(steps).filter(step => step.builtin).length;
      const customSteps = Object.values(steps).filter(step => !step.builtin).length;
      
      expect(builtinSteps).toBe(8);
      expect(customSteps).toBe(36);
    });
  });

  describe('Blueprint compilation', () => {
    it('should compile a simple blueprint', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            sitename: 'Test Site',
            tagline: 'A test site'
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
            sitename: 'Landing Page Test',
            tagline: 'Testing landingPage preservation'
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
            sitename: 'Multi Test',
            tagline: 'Multiple steps test'
          },
          {
            step: 'login',
            username: 'admin',
            password: 'password'
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
            sitename: 'JSON Test',
            tagline: 'JSON string test'
          }
        ]
      };
      
      const jsonString = JSON.stringify(blueprint);
      const compiled = compiler.compile(jsonString);
      expect(compiled.steps).toHaveLength(1);
    });
  });

  describe('Blueprint validation', () => {
    it('should validate a valid blueprint', () => {
      const blueprint = {
        steps: [
          {
            step: 'setSiteName',
            sitename: 'Test Site',
            tagline: 'A test site'
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
            sitename: 'Test Site',
            tagline: 'A test site'
          }
        ]
      };
      
      const result = compiler.validateBlueprint(JSON.stringify(blueprint));
      expect(result.valid).toBe(true);
    });
  });
});