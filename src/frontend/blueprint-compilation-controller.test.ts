import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlueprintCompilationController } from './blueprint-compilation-controller';
import { isManualEditMode } from './app-state';

describe('BlueprintCompilationController', () => {
	let controller: BlueprintCompilationController;

	beforeEach(() => {
		document.body.textContent = '';
		isManualEditMode.value = true;

		const playground = document.createElement('input');
		playground.id = 'playground';
		playground.value = 'https://wordpress.com/setup/onboarding/playground';
		document.body.appendChild(playground);

		const playgroundLink = document.createElement('a');
		playgroundLink.id = 'playground-link';
		document.body.appendChild(playgroundLink);

		const iframe = document.createElement('iframe');

		controller = new BlueprintCompilationController({
			getBlueprintValue: () => '{}',
			setBlueprintValue: () => {},
			blueprintUIDeps: {
				playgroundIframe: iframe
			}
		});
	});

	afterEach(() => {
		isManualEditMode.value = false;
		document.body.textContent = '';
	});

	it('should not prefix https custom playground URLs again', () => {
		controller.transformJson();

		const playgroundLink = document.getElementById('playground-link') as HTMLAnchorElement;
		expect(playgroundLink.href).toMatch(/^https:\/\/wordpress\.com\/setup\/onboarding\/playground\/#/);
		expect(playgroundLink.href).not.toContain('https://https');
	});
});
