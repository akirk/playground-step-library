import { describe, it, expect } from 'vitest';
import { installAdminer } from './installAdminer.js';
import type { InstallAdminerStep } from './types.js';

describe('installAdminer', () => {
  it('should create the required directory structure and files', () => {
    const step: InstallAdminerStep = {
      step: 'installAdminer'
    };

    const result = installAdminer(step).toV1();

    expect(result).toHaveLength(5);

    // Should create mu-plugins directory
    expect(result[0]).toEqual({
      step: 'mkdir',
      path: '/wordpress/wp-content/mu-plugins'
    });

    // Should create adminer link PHP file
    expect(result[1]).toEqual({
      step: 'writeFile',
      path: '/wordpress/wp-content/mu-plugins/adminer-link.php',
      data: expect.stringContaining('add_action( \'admin_bar_menu\'')
    });
    expect(result[1].data).toContain('Adminer');

    // Should create adminer directory
    expect(result[2]).toEqual({
      step: 'mkdir',
      path: '/wordpress/adminer'
    });

    // Should create index.php with login bypass and WordPress admin bar
    expect(result[3]).toEqual({
      step: 'writeFile',
      path: '/wordpress/adminer/index.php',
      data: expect.stringContaining('AdminerLoginPasswordLess')
    });
    expect(result[3].data).toContain('function login( $login, $password )');
    expect(result[3].data).toContain('return true');
    expect(result[3].data).toContain('#wp-admin-bar');
    expect(result[3].data).toContain('← WordPress Admin');
    expect(result[3].data).toContain('function head()');
    expect(result[3].data).toContain('function loginForm()');
    expect(result[3].data).toContain('function homepage()');

    // Should download Adminer PHP file
    expect(result[4]).toEqual({
      step: 'writeFile',
      path: '/wordpress/adminer/adminer.php',
      data: {
        resource: 'url',
        url: 'https://github.com/vrana/adminer/releases/download/v5.3.0/adminer-5.3.0-en.php'
      }
    });
  });

  it('should have proper metadata', () => {
    expect(installAdminer.description).toBe('Install Adminer with auto login link.');
    expect(installAdminer.vars).toEqual([]);
  });
});