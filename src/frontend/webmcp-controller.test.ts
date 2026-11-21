/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import PlaygroundStepLibrary from '../index';
import { registerWebMcpTools } from './webmcp-controller';
import { StepLibraryController } from './step-library-controller';
import { StateController } from './state-controller';
import { BlueprintCompilationController } from './blueprint-compilation-controller';
import { blueprintEventBus } from './blueprint-event-bus';
import * as appState from './app-state';
import { extractStepDataFromElement } from './blueprint-compiler';
import { processSteps } from './step-utils';
import { clearHistory, addBlueprintToHistoryWithId } from './my-blueprints';
import { clearMySteps, saveMyStep } from './custom-steps';
import type { StepConfig, StepData, StepDefinition } from './types';
import type { ExampleState } from './examples';

interface CapturedTool {
	name: string;
	description: string;
	inputSchema?: Record<string, any>;
	annotations?: Record<string, any>;
	execute: (input: any, options: { signal: AbortSignal }) => Promise<any>;
	signal?: AbortSignal;
}

const TEST_EXAMPLES: Record<string, ExampleState> = {
	'WooCommerce Store': {
		slug: 'woocommerce',
		title: 'WooCommerce Store',
		steps: [
			{ step: 'installPlugin', vars: { url: 'woocommerce' } },
			{ step: 'setSiteName', vars: { sitename: 'Demo Shop' } }
		]
	},
	'Minimal Blog': {
		slug: 'minimal-blog',
		title: 'Minimal Blog',
		steps: [
			{ step: 'setSiteName', vars: { sitename: 'My Blog' } }
		]
	}
};

const TEST_EXAMPLES_BY_SLUG: Record<string, ExampleState> = {
	woocommerce: TEST_EXAMPLES['WooCommerce Store'],
	'minimal-blog': TEST_EXAMPLES['Minimal Blog']
};

function setupDom() {
	document.body.innerHTML = `
		<input type="text" id="title" value="">
		<select id="examples"><option>Examples</option><option value="WooCommerce Store">WooCommerce Store</option></select>
		<select id="wp-version">
			<option value="latest">latest</option>
			<option value="6.4">6.4</option>
			<option value="6.5">6.5</option>
			<option value="6.6">6.6</option>
			<option value="beta">beta</option>
			<option value="nightly">nightly</option>
		</select>
		<select id="php-version">
			<option value="latest">latest</option>
			<option value="7.4">7.4</option>
			<option value="8.0">8.0</option>
			<option value="8.1">8.1</option>
			<option value="8.2">8.2</option>
			<option value="8.3">8.3</option>
		</select>
		<select id="mode">
			<option value="browser-full-screen">Fake Browser (full screen)</option>
			<option value="browser">Fake Browser</option>
			<option value="seamless">Seamless</option>
		</select>
		<select id="storage">
			<option value="none">None</option>
			<option value="browser">Browser</option>
			<option value="device">Device</option>
		</select>
		<select id="playground">
			<option value="playground.wordpress.net">playground.wordpress.net</option>
		</select>
		<select id="encoding-format">
			<option value="auto">auto</option>
			<option value="hash">hash</option>
			<option value="base64">base64</option>
		</select>
		<input type="text" id="autosave" value="">
		<input type="checkbox" id="networking" checked>
		<input type="checkbox" id="wp-cli">
		<input type="checkbox" id="exclude-meta">
		<select id="preview-mode">
			<option value="">Off</option>
			<option value="bottom">Bottom</option>
			<option value="right">Right</option>
		</select>
		<input type="radio" name="blueprint-version" value="v1" checked>
		<input type="radio" name="blueprint-version" value="v2">
		<div id="step-library"></div>
		<div id="blueprint-steps"><div id="draghint">Click or drag the steps to add them here.</div></div>
		<textarea id="blueprint-compiled">{}</textarea>
		<a id="playground-link" href="#">Launch</a>
		<div id="split-view-container" style="display: none;"><iframe id="playground-iframe"></iframe></div>
		<details id="blueprint-size-warning" style="display: none;"></details>
	`;
}

describe('WebMCP Controller', () => {
	let capturedTools: Map<string, CapturedTool>;
	let dispose: () => void;
	let mockHistoryChanged: ReturnType<typeof vi.fn>;
	let originalModelContextDescriptor: PropertyDescriptor | undefined;

	beforeEach(() => {
		if (typeof (globalThis as any).Option === 'undefined') {
			(globalThis as any).Option = function (text = '', value = '', defaultSelected = false, selected = false) {
				const opt = document.createElement('option');
				opt.text = text;
				opt.value = value;
				opt.defaultSelected = defaultSelected;
				opt.selected = selected;
				return opt;
			};
		}
		setupDom();
		clearHistory();
		clearMySteps();
		appState.isManualEditMode.value = false;
		appState.setBlueprint('');
		blueprintEventBus.removeAllListeners();

		const compiler = new PlaygroundStepLibrary();
		const customSteps = compiler.getAvailableSteps() as Record<string, StepDefinition>;
		const stepList = document.getElementById('step-library')!;
		const blueprintSteps = document.getElementById('blueprint-steps')!;
		const compiledTextarea = document.getElementById('blueprint-compiled') as HTMLTextAreaElement;

		const stepLibraryController = new StepLibraryController({
			stepList,
			customSteps,
			showCallbacks: appState.showCallbacks
		});
		stepLibraryController.initializeStepLibrary();

		const stateController = new StateController({ blueprintSteps, stepList });
		const compilationController = new BlueprintCompilationController({
			getBlueprintValue: () => compiledTextarea.value,
			setBlueprintValue: (value: string) => {
				compiledTextarea.value = value;
			},
			blueprintUIDeps: {
				splitViewContainer: document.getElementById('split-view-container')!,
				playgroundIframe: document.getElementById('playground-iframe') as HTMLIFrameElement
			}
		});

		const loadCombined = () => {
			const steps: StepData[] = [];
			blueprintSteps.querySelectorAll('.step').forEach(el => {
				steps.push(extractStepDataFromElement(el as HTMLElement));
			});
			const title = (document.getElementById('title') as HTMLInputElement).value;
			const wpCli = (document.getElementById('wp-cli') as HTMLInputElement).checked;
			appState.setBlueprint(
				JSON.stringify({
					landingPage: '/',
					...(title ? { title } : {}),
					...(wpCli ? { extraLibraries: ['wp-cli'] } : {}),
					steps
				})
			);
			compilationController.transformJson();
		};
		blueprintEventBus.on('blueprint:updated', loadCombined);

		const captureCurrentSteps = (): StepConfig => {
			const steps: StepData[] = [];
			blueprintSteps.querySelectorAll('.step').forEach(el => {
				steps.push(extractStepDataFromElement(el as HTMLElement));
			});
			const title = (document.getElementById('title') as HTMLInputElement).value;
			return { steps, ...(title ? { title } : {}) };
		};

		const restoreSteps = (stepsData: StepConfig, title: string) => {
			appState.isManualEditMode.value = false;
			blueprintSteps.textContent = '';
			if (title) {
				(document.getElementById('title') as HTMLInputElement).value = title;
			}
			processSteps(stepsData.steps || [], blueprintSteps);
			blueprintEventBus.emit('blueprint:updated');
		};

		const restoreExample = (example: ExampleState) => {
			(document.getElementById('examples') as HTMLSelectElement).value = example.title;
			stateController.restoreState({ extraLibraries: [], ...example });
		};

		capturedTools = new Map();
		originalModelContextDescriptor = Object.getOwnPropertyDescriptor(document, 'modelContext');
		Object.defineProperty(document, 'modelContext', {
			configurable: true,
			value: {
				registerTool: vi.fn(async (tool: any, options?: { signal?: AbortSignal }) => {
					capturedTools.set(tool.name, { ...tool, signal: options?.signal });
				})
			}
		});

		mockHistoryChanged = vi.fn();
		dispose = registerWebMcpTools({
			blueprintSteps,
			customSteps,
			getBlueprintValue: () => compiledTextarea.value,
			transformJson: () => compilationController.transformJson(),
			captureCurrentSteps,
			restoreSteps,
			restoreExample,
			isBlueprintAlreadySaved: () => false,
			onHistoryChanged: mockHistoryChanged,
			examples: TEST_EXAMPLES,
			examplesBySlug: TEST_EXAMPLES_BY_SLUG
		});
	});

	afterEach(() => {
		dispose?.();
		if (originalModelContextDescriptor) {
			Object.defineProperty(document, 'modelContext', originalModelContextDescriptor);
		} else {
			delete (document as any).modelContext;
		}
		blueprintEventBus.removeAllListeners();
		clearHistory();
		clearMySteps();
	});

	function exec(name: string, input: Record<string, any> = {}, signal?: AbortSignal) {
		const tool = capturedTools.get(name);
		expect(tool, `Tool ${name} should be registered`).toBeDefined();
		const execSignal = signal || new AbortController().signal;
		return tool!.execute(input, { signal: execSignal });
	}

	it('no-ops cleanly when document.modelContext is unavailable', () => {
		delete (document as any).modelContext;
		const cleanup = registerWebMcpTools({
			blueprintSteps: document.getElementById('blueprint-steps')!,
			customSteps: {},
			getBlueprintValue: () => '{}',
			transformJson: () => {},
			captureCurrentSteps: () => ({ steps: [] }),
			restoreSteps: () => {},
			restoreExample: () => {},
			isBlueprintAlreadySaved: () => true
		});
		expect(typeof cleanup).toBe('function');
		expect(() => cleanup()).not.toThrow();
	});

	it('registers all 13 tools matching webmcp/schema.json, budgets, annotations, and evals.json', () => {
		const schema = JSON.parse(readFileSync(resolve(process.cwd(), 'webmcp/schema.json'), 'utf8'));
		const evals = JSON.parse(readFileSync(resolve(process.cwd(), 'webmcp/evals.json'), 'utf8'));

		expect(capturedTools.size).toBe(13);
		expect(schema.tools.map((t: any) => t.name)).toEqual(Array.from(capturedTools.keys()));

		const forbiddenJargon = /\b(redux|pinia|express|postgres|rest|graphql|grpc|localstorage|react query)\b/i;

		for (const schemaTool of schema.tools) {
			const registered = capturedTools.get(schemaTool.name)!;
			expect(registered.name.length).toBeLessThanOrEqual(30);
			expect(registered.description.length).toBeLessThanOrEqual(500);
			expect(registered.description).toBe(schemaTool.description);
			expect(registered.description).not.toMatch(forbiddenJargon);
			expect(registered.signal).toBeInstanceOf(AbortSignal);
			expect(registered.signal?.aborted).toBe(false);

			// Annotations are strictly opt-in (no : false values)
			if (registered.annotations) {
				for (const val of Object.values(registered.annotations)) {
					expect(val).toBe(true);
				}
			}

			// Parameter names <= 30 chars, descriptions <= 150 chars
			const props = registered.inputSchema?.properties || {};
			for (const [paramName, propSchema] of Object.entries<any>(props)) {
				expect(paramName.length).toBeLessThanOrEqual(30);
				if (propSchema.description) {
					expect(propSchema.description.length).toBeLessThanOrEqual(150);
					expect(propSchema.description).not.toMatch(forbiddenJargon);
				}
			}
		}

		// Verify evals.json references only registered tools and uses valid message types
		const toolNames = new Set(capturedTools.keys());
		const checkExpected = (node: any) => {
			if (Array.isArray(node)) {
				node.forEach(checkExpected);
			} else if (node?.ordered) {
				checkExpected(node.ordered);
			} else if (node?.unordered) {
				checkExpected(node.unordered);
			} else if (node?.functionName) {
				expect(toolNames.has(node.functionName)).toBe(true);
			}
		};
		for (const testCase of evals) {
			expect(Array.isArray(testCase.messages)).toBe(true);
			for (const msg of testCase.messages) {
				expect(['message', 'functioncall', 'functionresponse']).toContain(msg.type);
			}
			checkExpected(testCase.expectedCall);
		}
	});

	it('aborts registration AbortSignal on dispose()', () => {
		const signal = capturedTools.get('search_steps')!.signal!;
		expect(signal.aborted).toBe(false);
		dispose();
		expect(signal.aborted).toBe(true);
	});

	it('respects execution AbortSignal cancellation', async () => {
		const ac = new AbortController();
		ac.abort();
		const res = await exec('search_steps', { query: 'plugin' }, ac.signal);
		expect(res.code).toBe('CANCELLED');
		expect(res.retryable).toBe(true);
	});

	it('search_steps filters by query/category, paginates under 1500 chars, and provides relaxation hints', async () => {
		const res = await exec('search_steps', { query: 'plugin', category: 'plugins-themes', page_size: 5 });
		expect(res.total_count).toBeGreaterThan(0);
		expect(res.items.some((i: any) => i.step === 'installPlugin')).toBe(true);
		expect(JSON.stringify(res).length).toBeLessThanOrEqual(1500);

		const zero = await exec('search_steps', { query: 'installPlugin', category: 'content' });
		expect(zero.total_count).toBe(0);
		expect(zero.suggestion).toContain('category');
		expect(JSON.stringify(zero).length).toBeLessThanOrEqual(1500);
	});

	it('list_examples and load_example_blueprint guard non-empty workspace until force: true', async () => {
		const listed = await exec('list_examples', { query: 'woo' });
		expect(listed.total_count).toBe(1);
		expect(listed.items[0].slug).toBe('woocommerce');
		expect(JSON.stringify(listed).length).toBeLessThanOrEqual(1500);

		const loaded = await exec('load_example_blueprint', { example: 'woocommerce' });
		expect(loaded.status).toBe('loaded');
		expect(loaded.step_count).toBe(2);

		// Trying to load another example while workspace is non-empty returns WORKSPACE_NOT_EMPTY
		const blocked = await exec('load_example_blueprint', { example: 'minimal-blog' });
		expect(blocked.code).toBe('WORKSPACE_NOT_EMPTY');
		expect(blocked.retryable).toBe(true);

		const forced = await exec('load_example_blueprint', { example: 'minimal-blog', force: true });
		expect(forced.status).toBe('loaded');
		expect(forced.step_count).toBe(1);
	});

	it('update_blueprint_steps performs batched add, update, move, remove and enforces manual edit guard', async () => {
		const unknown = await exec('update_blueprint_steps', {
			operations: [{ action: 'add', step: 'nonExistentStep' }]
		});
		expect(unknown.code).toBe('UNKNOWN_STEP');

		const added = await exec('update_blueprint_steps', {
			operations: [
				{ action: 'add', step: 'installPlugin', vars: { url: 'woocommerce' } },
				{ action: 'add', step: 'setSiteName', vars: { sitename: 'Initial' } }
			]
		});
		expect(added.status).toBe('updated');
		expect(added.step_count).toBe(2);

		const modified = await exec('update_blueprint_steps', {
			operations: [
				{ action: 'update', index: 1, vars: { sitename: 'Updated Shop' } },
				{ action: 'move', index: 1, to_index: 0 }
			]
		});
		expect(modified.steps[0].step).toBe('setSiteName');
		expect(modified.steps[1].step).toBe('installPlugin');

		const state = await exec('get_blueprint_state', {});
		expect(state.steps[0].vars.sitename).toBe('Updated Shop');
		expect(JSON.stringify(state).length).toBeLessThanOrEqual(1500);

		// Manual edit mode guard
		appState.isManualEditMode.value = true;
		const guarded = await exec('update_blueprint_steps', {
			operations: [{ action: 'remove', index: 0 }]
		});
		expect(guarded.code).toBe('MANUAL_EDIT_ACTIVE');

		const forcedRemove = await exec('update_blueprint_steps', {
			operations: [{ action: 'remove', index: 0 }],
			force: true
		});
		expect(forcedRemove.step_count).toBe(1);
	});

	it('update_blueprint_settings updates UI controls and validates site_slug', async () => {
		const badSlug = await exec('update_blueprint_settings', { site_slug: 'Bad Slug!' });
		expect(badSlug.code).toBe('INVALID_SITE_SLUG');

		const res = await exec('update_blueprint_settings', {
			title: 'Shop Setup',
			wp_version: '6.6',
			php_version: '8.2',
			blueprint_version: 'v2',
			display_mode: 'seamless',
			storage: 'browser',
			preload_wp_cli: true,
			site_slug: 'my-shop'
		});
		expect(res.status).toBe('updated');
		expect(res.settings.wp_version).toBe('6.6');
		expect(res.settings.php_version).toBe('8.2');
		expect(res.settings.blueprint_version).toBe('v2');
		expect(res.settings.preload_wp_cli).toBe(true);
		expect(res.settings.site_slug).toBe('my-shop');
	});

	it('set_preview_mode switches preview pane and get_blueprint_output returns paginated JSON, URLs, and AI instructions', async () => {
		const emptyOut = await exec('get_blueprint_output', { format: 'urls' });
		expect(emptyOut.code).toBe('EMPTY_BLUEPRINT');

		await exec('update_blueprint_steps', {
			operations: [{ action: 'add', step: 'installPlugin', vars: { url: 'woocommerce' } }]
		});

		const preview = await exec('set_preview_mode', { position: 'right' });
		expect(preview.preview_mode).toBe('right');
		expect((document.getElementById('preview-mode') as HTMLSelectElement).value).toBe('right');

		const jsonChunk = await exec('get_blueprint_output', { format: 'json', offset: 0, limit: 150 });
		expect(jsonChunk.format).toBe('json');
		expect(jsonChunk.total_length).toBeGreaterThan(0);
		expect(JSON.stringify(jsonChunk).length).toBeLessThanOrEqual(1500);

		const urls = await exec('get_blueprint_output', { format: 'urls' });
		expect(urls.format).toBe('urls');
		expect(urls.playground_url).toContain('playground.wordpress.net');
		expect(JSON.stringify(urls).length).toBeLessThanOrEqual(1500);

		// Prerequisite error when no GitHub URLs exist
		const missingGh = await exec('get_blueprint_output', { format: 'ai_instructions' });
		expect(missingGh.code).toBe('MISSING_GITHUB_URL');

		// Add a GitHub plugin step and generate AI instructions
		await exec('update_blueprint_steps', {
			operations: [
				{ action: 'add', step: 'installPlugin', vars: { url: 'https://github.com/akirk/friends/tree/main' } }
			]
		});
		const ai = await exec('get_blueprint_output', { format: 'ai_instructions', url_type: 'step-library' });
		expect(ai.format).toBe('ai_instructions');
		expect(ai.content).toContain('BRANCH_NAME');
		expect(JSON.stringify(ai).length).toBeLessThanOrEqual(1500);
	});

	it('manages saved blueprints (list, save conflict, rename, restore unsaved guard, delete) and clear_blueprint', async () => {
		await exec('update_blueprint_steps', {
			operations: [{ action: 'add', step: 'installPlugin', vars: { url: 'woocommerce' } }]
		});

		const saved = await exec('save_blueprint', { title: 'Agency Starter' });
		expect(saved.status).toBe('saved');
		expect(mockHistoryChanged).toHaveBeenCalled();

		// Duplicate name guard
		const conflict = await exec('save_blueprint', { title: 'Agency Starter' });
		expect(conflict.code).toBe('NAME_CONFLICT');

		// Rename
		const renamed = await exec('save_blueprint', { rename_from_id: saved.id, title: 'Agency Starter v2' });
		expect(renamed.status).toBe('renamed');

		// List with personal steps
		saveMyStep('My Custom Step', { step: 'setSiteName', description: 'Custom' });
		const listed = await exec('list_saved_blueprints', { query: 'Agency', include_personal_steps: true });
		expect(listed.total_count).toBe(1);
		expect(listed.items[0].title).toBe('Agency Starter v2');
		expect(listed.personal_steps).toContain('My Custom Step');
		expect(JSON.stringify(listed).length).toBeLessThanOrEqual(1500);

		// Restore guard when workspace has unsaved steps
		const blockedRestore = await exec('restore_saved_blueprint', { id: saved.id });
		expect(blockedRestore.code).toBe('UNSAVED_CHANGES');

		const restored = await exec('restore_saved_blueprint', { id: saved.id, force: true });
		expect(restored.status).toBe('restored');

		// Delete
		const deleted = await exec('delete_saved_blueprints', { ids: [saved.id, 999999] });
		expect(deleted.status).toBe('deleted');
		expect(deleted.deleted_ids).toEqual([saved.id]);
		expect(deleted.not_found_ids).toEqual([999999]);

		// Seed another entry to confirm clear_blueprint only clears workspace
		addBlueprintToHistoryWithId({ steps: [] }, { steps: [] }, 'Keep Me');
		const cleared = await exec('clear_blueprint', {});
		expect(cleared.status).toBe('cleared');
		expect(cleared.removed_steps).toBe(1);
		expect(document.querySelectorAll('#blueprint-steps .step').length).toBe(0);
	});
});
