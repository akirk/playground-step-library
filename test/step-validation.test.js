import { describe, it, expect } from 'vitest';
import PlaygroundStepLibrary from '../lib/src/index.js';

// Valid WordPress Playground step types based on @wp-playground/blueprints
const VALID_STEP_TYPES = [
  'activatePlugin',
  'activateTheme', 
  'cp',
  'defineWpConfigConst',
  'enableMultisite',
  'importWxr',
  'installPlugin',
  'installTheme',
  'login',
  'mkdir',
  'mv',
  'request',
  'rm',
  'rmdir',
  'runPHP',
  'runWpInstallationWizard',
  'setSiteOptions',
  'unzip',
  'writeFile',
  // Extended step types that are valid in WordPress Playground
  'wp-cli',
  'updateUserMeta',
  'setSiteLanguage',
  'defineWpConfigConsts'
];

describe('Step Output Validation', () => {
  let compiler;
  
  beforeEach(() => {
    compiler = new PlaygroundStepLibrary();
  });

  /**
   * Validates that a step output conforms to WordPress Playground Step schema
   */
  function validateStepOutput(stepOutput, stepName) {
    expect(stepOutput, `${stepName} should return an array`).toBeInstanceOf(Array);
    
    stepOutput.forEach((step, index) => {
      expect(step, `${stepName}[${index}] should be an object`).toBeTypeOf('object');
      expect(step, `${stepName}[${index}] should not be null`).not.toBeNull();
      
      // Every step must have a 'step' property
      expect(step, `${stepName}[${index}] must have 'step' property`).toHaveProperty('step');
      expect(step.step, `${stepName}[${index}].step must be a string`).toBeTypeOf('string');
      expect(step.step, `${stepName}[${index}].step cannot be empty`).toBeTruthy();
      
      // The step type must be valid
      expect(VALID_STEP_TYPES, `${stepName}[${index}].step "${step.step}" is not a valid WordPress Playground step type. Valid types: ${VALID_STEP_TYPES.join(', ')}`).toContain(step.step);
      
      // Validate deduplication strategy in PHP comments (if runPHP step)
      if (step.step === 'runPHP' && step.code && typeof step.code === 'string') {
        const hasStrategy = step.code.includes('// DEDUP_STRATEGY:');
        if (hasStrategy) {
          const validStrategies = ['keep_last'];
          const strategyMatch = step.code.match(/\/\/ DEDUP_STRATEGY:\s*(\w+)/);
          if (strategyMatch) {
            expect(validStrategies, `${stepName}[${index}] has invalid dedup strategy "${strategyMatch[1]}". Valid strategies: ${validStrategies.join(', ')}`).toContain(strategyMatch[1]);
          }
        }
      }
      
      // Validate step-specific required properties
      validateStepSpecificProperties(step, stepName, index);
    });
  }

  /**
   * Validates step-specific required properties
   */
  function validateStepSpecificProperties(step, stepName, index) {
    const stepType = step.step;
    
    switch (stepType) {
      case 'runPHP':
        expect(step, `${stepName}[${index}] runPHP step must have 'code' property`).toHaveProperty('code');
        expect(step.code, `${stepName}[${index}] runPHP code must be a string`).toBeTypeOf('string');
        break;
        
      case 'writeFile':
        expect(step, `${stepName}[${index}] writeFile step must have 'path' property`).toHaveProperty('path');
        expect(step, `${stepName}[${index}] writeFile step must have 'data' property`).toHaveProperty('data');
        expect(step.path, `${stepName}[${index}] writeFile path must be a string`).toBeTypeOf('string');
        break;
        
      case 'mkdir':
        expect(step, `${stepName}[${index}] mkdir step must have 'path' property`).toHaveProperty('path');
        expect(step.path, `${stepName}[${index}] mkdir path must be a string`).toBeTypeOf('string');
        break;
        
      case 'installPlugin':
        expect(step, `${stepName}[${index}] installPlugin step must have 'pluginData' or 'pluginZipFile' property`).toSatisfy(
          s => s.hasOwnProperty('pluginData') || s.hasOwnProperty('pluginZipFile')
        );
        break;
        
      case 'installTheme':
        expect(step, `${stepName}[${index}] installTheme step must have 'themeData' or 'themeZipFile' property`).toSatisfy(
          s => s.hasOwnProperty('themeData') || s.hasOwnProperty('themeZipFile')
        );
        break;
        
      case 'setSiteOptions':
        expect(step, `${stepName}[${index}] setSiteOptions step must have 'options' property`).toHaveProperty('options');
        expect(step.options, `${stepName}[${index}] setSiteOptions options must be an object`).toBeTypeOf('object');
        break;
        
      case 'login':
        expect(step, `${stepName}[${index}] login step must have 'username' property`).toHaveProperty('username');
        expect(step, `${stepName}[${index}] login step must have 'password' property`).toHaveProperty('password');
        break;
        
      case 'importWxr':
        expect(step, `${stepName}[${index}] importWxr step must have 'file' property`).toHaveProperty('file');
        break;
        
      case 'defineWpConfigConst':
        expect(step, `${stepName}[${index}] defineWpConfigConst step must have 'consts' property`).toHaveProperty('consts');
        expect(step.consts, `${stepName}[${index}] defineWpConfigConst consts must be an object`).toBeTypeOf('object');
        break;
    }
  }

  describe('Built-in Steps', () => {
    const builtinSteps = [
      'defineWpConfigConst',
      'importWxr', 
      'installPlugin',
      'installTheme',
      'login',
      'runPHP',
      'setSiteOption',
      'enableMultisite'
    ];

    builtinSteps.forEach(stepName => {
      it(`${stepName} should output valid Steps`, () => {
        const steps = compiler.getAvailableSteps();
        expect(steps, `Step ${stepName} should be available`).toHaveProperty(stepName);
        
        const stepFunction = compiler.customSteps[stepName];
        
        // Create a minimal valid input based on the step's variable requirements
        const stepInput = createStepInput(stepName, steps[stepName].vars);
        
        // Create a mock blueprint for steps that need it
        const mockBlueprint = { steps: [] };
        
        const result = stepFunction(stepInput, mockBlueprint);
        validateStepOutput(result, stepName);
      });
    });
  });

  describe('Custom Steps', () => {
    const customSteps = [
      'addClientRole',
      'addCorsProxy', 
      'addFilter',
      'addMedia',
      // 'addPage', // Temporarily disabled - converted to flattened TypeScript structure
      'addPost',
      'addProduct',
      'blueprintExtractor',
      'blueprintRecorder',
      'changeAdminColorScheme',
      'createUser',
      'customPostType',
      'deleteAllPosts',
      'disableWelcomeGuides',
      'doAction',
      'fakeHttpResponse',
      'githubImportExportWxr',
      'githubPlugin',
      'githubPluginRelease',
      'githubTheme',
      'importFriendFeeds',
      'importWordPressComExport',
      'installPhEditor',
      'installPhpLiteAdmin',
      'jetpackOfflineMode',
      'muPlugin',
      'removeDashboardWidgets',
      'renameDefaultCategory',
      'runWpCliCommand',
      'sampleContent',
      'setLandingPage',
      'setLanguage',
      'setSiteName',
      'setTT4Homepage',
      'showAdminNotice',
      'skipWooCommerceWizard'
    ];

    customSteps.forEach(stepName => {
      it(`${stepName} should output valid Steps`, () => {
        const steps = compiler.getAvailableSteps();
        expect(steps, `Step ${stepName} should be available`).toHaveProperty(stepName);
        
        const stepFunction = compiler.customSteps[stepName];
        
        // Create a minimal valid input based on the step's variable requirements
        const stepInput = createStepInput(stepName, steps[stepName].vars);
        
        // Create a mock blueprint for steps that need it
        const mockBlueprint = { steps: [] };
        
        const result = stepFunction(stepInput, mockBlueprint);
        validateStepOutput(result, stepName);
      });
    });
  });

  /**
   * Creates a minimal valid step input based on the step's variable requirements
   */
  function createStepInput(stepName, vars) {
    const stepInput = {
      step: stepName
    };

    // Add required variables with sample values directly to stepInput (flattened structure)
    vars.forEach(varDef => {
      if (varDef.required) {
        if (varDef.samples && varDef.samples.length > 0) {
          stepInput[varDef.name] = varDef.samples[0];
        } else {
          // Provide sensible defaults based on variable name and type
          stepInput[varDef.name] = getDefaultValueForVariable(varDef);
        }
      }
    });

    // Add common properties that steps might need
    stepInput.stepIndex = 0;

    return stepInput;
  }

  function getDefaultValueForVariable(varDef) {
    const name = varDef.name.toLowerCase();
    const type = varDef.type;

    if (type === 'boolean') return true;
    if (type === 'number') return 1;
    
    // String defaults based on common patterns
    if (name.includes('title')) return 'Test Title';
    if (name.includes('content')) return 'Test content';
    if (name.includes('name')) return 'testName';
    if (name.includes('username')) return 'admin';
    if (name.includes('password')) return 'password';
    if (name.includes('email')) return 'test@example.com';
    if (name.includes('url')) return 'https://example.com/test.zip';
    if (name.includes('path')) return '/test/path';
    if (name.includes('code')) return '<?php echo "test"; ?>';
    if (name.includes('slug')) return 'test-slug';
    if (name.includes('language')) return 'en_US';
    if (name.includes('role')) return 'editor';
    if (name.includes('color')) return 'blue';
    
    return 'test-value';
  }
});