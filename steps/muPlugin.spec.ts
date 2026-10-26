import { describe, it, expect } from 'vitest';
import { muPlugin } from './muPlugin.js';
import { showAdminNotice } from './showAdminNotice.js';

describe.each(['toV1', 'toV2'] as const)('muPlugin %s', (version) => {
	const compile = (code: string) => {
		const result = muPlugin({ step: 'muPlugin', vars: { code } });
		return version === 'toV1'
			? result.toV1().steps[1].data
			: result.toV2().muPlugins![0].content;
	};

	it.each(['', 'echo "Hello";', '<?php echo "Hello";', ' \n\t<?php\necho "Hello";'])(
		'adds exactly one leading opening tag for %j', (code) => {
			expect(compile(code)).toBe(code === '' ? '<?php ' : '<?php echo "Hello";');
		}
	);

	it('preserves PHP tags after inline HTML', () => {
		const code = '<?php echo "Hello"; ?><p><?php echo "World"; ?></p><?php echo "!";';
		expect(compile(code)).toBe(code);
	});

	it('preserves PHP tags in dismissible admin notices', () => {
		const result = showAdminNotice({
			step: 'showAdminNotice',
			stepIndex: 0,
			vars: { text: 'Welcome!', type: 'success', dismissible: true }
		});
		const code = version === 'toV1'
			? result.toV1().steps[1].data
			: result.toV2().muPlugins![0].content;
		expect(code).toContain("<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>");
		expect(code).toContain("<?php echo esc_html( wp_create_nonce( 'custom-admin-notice-0' ) ); ?>");
		expect(code).toContain('</script>\n\t<?php\n} );');
	});
});
