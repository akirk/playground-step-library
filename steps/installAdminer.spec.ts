import { describe, it, expect } from 'vitest';
import { installAdminer } from './installAdminer.js';
import type { InstallAdminerStep } from './types.js';

describe('installAdminer', () => {
  it('should create the required directory structure and files', () => {
    const step: InstallAdminerStep = {
      step: 'installAdminer'
    };

    const result = installAdminer(step).toV1();

    expect(result.steps).toHaveLength(5);

    // Should create mu-plugins directory
    expect(result.steps[0]).toEqual({
      step: 'mkdir',
      path: '/wordpress/wp-content/mu-plugins'
    });

    // Should create adminer link PHP file
    expect(result.steps[1]).toEqual({
      step: 'writeFile',
      path: '/wordpress/wp-content/mu-plugins/adminer-link.php',
      data: expect.stringContaining('add_action( \'admin_bar_menu\'')
    });
    expect(result.steps[1].data).toContain('Adminer');

    // Should create adminer directory
    expect(result.steps[2]).toEqual({
      step: 'mkdir',
      path: '/wordpress/adminer'
    });

    // Should create index.php with login bypass and WordPress admin bar
    expect(result.steps[3]).toEqual({
      step: 'writeFile',
      path: '/wordpress/adminer/index.php',
      data: expect.stringContaining('AdminerLoginPasswordLess')
    });
    expect(result.steps[3].data).toContain('function login( $login, $password )');
    expect(result.steps[3].data).toContain('return true');
    expect(result.steps[3].data).toContain('#wp-admin-bar');
    expect(result.steps[3].data).toContain('← WordPress Admin');
    expect(result.steps[3].data).toContain('function head()');
    expect(result.steps[3].data).toContain('function loginForm()');
    expect(result.steps[3].data).toContain('function homepage()');

    // Should download Adminer PHP file
    expect(result.steps[4]).toEqual({
      step: 'writeFile',
      path: '/wordpress/adminer/adminer.php',
      data: {
        resource: 'url',
        url: 'https://github.com/vrana/adminer/releases/download/v5.3.0/adminer-5.3.0-en.php'
      }
    });
  });

  it.each(['toV1', 'toV2'] as const)('should use the active database path in %s', (version) => {
    const result = installAdminer({ step: 'installAdminer' });
    const steps = version === 'toV1' ? result.toV1().steps : result.toV2().additionalStepsAfterExecution;

    expect(steps).toContainEqual({
      step: 'writeFile',
      path: '/wordpress/wp-content/mu-plugins/adminer-link.php',
      data: expect.stringContaining("'/adminer/?sqlite=&username=&db=' . rawurlencode( defined( 'DB_PATH' ) ? DB_PATH : FQDB )")
    });
  });

  it('should have proper metadata', () => {
    expect(installAdminer.description).toBe('Install Adminer with auto login link.');
    expect(installAdminer.vars).toEqual([]);
  });
});
