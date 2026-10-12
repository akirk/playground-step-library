import { describe, it, expect } from 'vitest';
import { installPhpLiteAdmin } from './installPhpLiteAdmin.js';

describe('installPhpLiteAdmin', () => {
  it.each(['toV1', 'toV2'] as const)('should read the active database path from Playground metadata in %s', (version) => {
    const result = installPhpLiteAdmin({ step: 'installPhpLiteAdmin' });
    const steps = version === 'toV1' ? result.toV1().steps : result.toV2().additionalStepsAfterExecution;
    const config = steps?.find(step => step && typeof step === 'object' &&
      step.step === 'writeFile' && step.path === '/wordpress/phpliteadmin.config.php');

    expect(config).toEqual({
      step: 'writeFile',
      path: '/wordpress/phpliteadmin.config.php',
      data: expect.stringContaining("$wp_env = require '/internal/shared/wp-env.php';")
    });
    expect(config).toHaveProperty('data', expect.stringContaining("'path'=> $wp_env['db']['path']"));
  });
});
