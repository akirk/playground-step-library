/**
 * WebMCP Controller
 * Exposes client-side WordPress Playground Step Library tools on document.modelContext
 */

import { STEP_CATEGORIES, STEP_CATEGORY_MAP } from '../step-categories';
import { extractStepDataFromElement } from './blueprint-compiler';
import { blueprintEventBus } from './blueprint-event-bus';
import { isManualEditMode } from './app-state';
import { createAndPopulateStep, populateStepVariables } from './step-utils';
import { generateRedirectUrl } from './url-controller';
import {
	generateAIInstructions,
	hasGitHubUrls,
	type AIInstructionsUrlType
} from './ai-instructions-generator';
import {
	addBlueprintToHistoryWithId,
	deleteBlueprintFromHistory,
	getBlueprintFromHistory,
	getHistory,
	renameBlueprintInHistory,
	saveHistory,
	type BlueprintHistoryEntry
} from './my-blueprints';
import { getMySteps } from './custom-steps';
import { generateLabel } from './label-generator';
import { examples as defaultExamples, examplesBySlug as defaultExamplesBySlug, type ExampleState } from './examples';
import type { StepConfig, StepData, StepDefinition } from './types';

const MAX_OUTPUT_CHARS = 1500;
const DEFAULT_PAGE_SIZE = 12;
const MAX_CHUNK_LIMIT = 1100;

export interface WebMcpControllerDependencies {
	blueprintSteps: HTMLElement;
	customSteps: Record<string, StepDefinition>;
	getBlueprintValue: () => string;
	transformJson: () => void;
	captureCurrentSteps: () => StepConfig;
	restoreSteps: (stepsData: StepConfig, title: string) => void;
	restoreExample: (example: ExampleState) => void;
	isBlueprintAlreadySaved: () => boolean;
	onHistoryChanged?: () => void;
	examples?: Record<string, ExampleState>;
	examplesBySlug?: Record<string, ExampleState>;
}

interface StructuredToolError {
	error: string;
	code: string;
	retryable: boolean;
	suggestion?: string;
	[key: string]: unknown;
}

function makeError(
	error: string,
	code: string,
	retryable: boolean,
	suggestion?: string,
	extra?: Record<string, unknown>
): StructuredToolError {
	return {
		error,
		code,
		retryable,
		...(suggestion ? { suggestion } : {}),
		...(extra || {})
	};
}

function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return text.slice(0, Math.max(0, maxLength - 1)) + '…';
}

function clampPage(page?: number): number {
	if (typeof page !== 'number' || !Number.isFinite(page) || page < 1) {
		return 1;
	}
	return Math.floor(page);
}

function clampPageSize(pageSize?: number): number {
	if (typeof pageSize !== 'number' || !Number.isFinite(pageSize) || pageSize < 1) {
		return DEFAULT_PAGE_SIZE;
	}
	return Math.min(DEFAULT_PAGE_SIZE, Math.floor(pageSize));
}

function fitWithinBudget<T extends Record<string, unknown>>(payload: T): T {
	if (JSON.stringify(payload).length <= MAX_OUTPUT_CHARS) {
		return payload;
	}
	const clone = { ...payload } as Record<string, unknown>;
	if (Array.isArray(clone.items)) {
		const items = [...clone.items];
		while (items.length > 1 && JSON.stringify({ ...clone, items }).length > MAX_OUTPUT_CHARS) {
			items.pop();
		}
		clone.items = items;
		clone.truncated = true;
	}
	if (Array.isArray(clone.steps)) {
		const steps = [...clone.steps];
		while (steps.length > 1 && JSON.stringify({ ...clone, steps }).length > MAX_OUTPUT_CHARS) {
			steps.pop();
		}
		clone.steps = steps;
		clone.truncated = true;
	}
	if (typeof clone.content === 'string') {
		let content = clone.content;
		while (content.length > 50 && JSON.stringify({ ...clone, content }).length > MAX_OUTPUT_CHARS) {
			content = content.slice(0, Math.floor(content.length * 0.85));
			clone.truncated = true;
		}
		clone.content = content;
	}
	return clone as T;
}

async function waitForUiSync(): Promise<void> {
	await Promise.resolve();
}

function checkAborted(signal?: AbortSignal): StructuredToolError | null {
	if (signal?.aborted) {
		return makeError('Tool execution was cancelled.', 'CANCELLED', true);
	}
	return null;
}

function readActiveSettings() {
	const titleEl = document.getElementById('title') as HTMLInputElement | null;
	const wpVersionEl = document.getElementById('wp-version') as HTMLSelectElement | null;
	const phpVersionEl = document.getElementById('php-version') as HTMLSelectElement | null;
	const blueprintVersionEl = document.querySelector('input[name="blueprint-version"]:checked') as HTMLInputElement | null;
	const modeEl = document.getElementById('mode') as HTMLSelectElement | null;
	const storageEl = document.getElementById('storage') as HTMLSelectElement | null;
	const networkingEl = document.getElementById('networking') as HTMLInputElement | null;
	const wpCliEl = document.getElementById('wp-cli') as HTMLInputElement | null;
	const encodingEl = document.getElementById('encoding-format') as HTMLSelectElement | null;
	const autosaveEl = document.getElementById('autosave') as HTMLInputElement | null;
	const excludeMetaEl = document.getElementById('exclude-meta') as HTMLInputElement | null;
	const previewModeEl = document.getElementById('preview-mode') as HTMLSelectElement | null;

	return {
		title: titleEl?.value || '',
		wp_version: wpVersionEl?.value || 'latest',
		php_version: phpVersionEl?.value || 'latest',
		blueprint_version: blueprintVersionEl?.value || 'v1',
		display_mode: modeEl?.value || 'browser-full-screen',
		storage: storageEl?.value || 'none',
		networking: networkingEl ? networkingEl.checked : true,
		preload_wp_cli: wpCliEl ? wpCliEl.checked : false,
		encoding_format: encodingEl?.value || 'auto',
		site_slug: autosaveEl?.value || '',
		exclude_meta: excludeMetaEl ? excludeMetaEl.checked : false,
		preview_mode: previewModeEl?.value || 'off'
	};
}

function summarizeStepVars(vars?: Record<string, unknown>): Record<string, unknown> {
	if (!vars) {
		return {};
	}
	const summary: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(vars)) {
		if (typeof value === 'string') {
			summary[key] = truncateText(value, 60);
		} else if (Array.isArray(value)) {
			summary[key] = value.slice(0, 3).map(v => (typeof v === 'string' ? truncateText(v, 40) : v));
		} else {
			summary[key] = value;
		}
	}
	return summary;
}

function getWorkspaceStepElements(blueprintSteps: HTMLElement): HTMLElement[] {
	return Array.from(blueprintSteps.querySelectorAll(':scope > .step')) as HTMLElement[];
}

function setElementValue(el: HTMLInputElement | HTMLSelectElement | null, value: string): void {
	if (el) {
		el.value = value;
	}
}

export function registerWebMcpTools(deps: WebMcpControllerDependencies): () => void {
	if (
		typeof document === 'undefined' ||
		!('modelContext' in document) ||
		!document.modelContext ||
		typeof document.modelContext.registerTool !== 'function'
	) {
		return () => {};
	}

	const modelContext = document.modelContext;
	const controller = new AbortController();
	const registrationOptions = { signal: controller.signal };
	const examplesMap = deps.examples ?? defaultExamples;
	const examplesSlugMap = deps.examplesBySlug ?? defaultExamplesBySlug;

	const dispose = () => {
		controller.abort();
	};

	const safeRegister = (registerPromise: Promise<void>) => {
		registerPromise.catch(err => {
			console.error('Failed to register WebMCP tool:', err);
		});
	};

	// 1. search_steps (trusted catalog query)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'search_steps',
				description:
					'Searches the catalog of WordPress Playground steps and returns their descriptions and configurable fields. Use when discovering which steps to add to a blueprint or checking the variable names a step accepts.',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'Keywords matching a step name, description, or variable'
						},
						category: {
							type: 'string',
							enum: [
								'content',
								'plugins-themes',
								'users-settings',
								'theme-dev',
								'code',
								'import-export',
								'admin-debug',
								'advanced'
							],
							description: 'Optional step category filter'
						},
						include_builtin: {
							type: 'boolean',
							description: 'Whether to include native built-in WordPress Playground steps (defaults to true)'
						},
						page: {
							type: 'integer',
							minimum: 1,
							description: 'Page number starting at 1'
						},
						page_size: {
							type: 'integer',
							minimum: 1,
							maximum: 12,
							description: 'Number of steps per page (up to 12)'
						}
					}
				},
				annotations: {
					readOnlyHint: true
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const query = (input.query || '').trim().toLowerCase();
						const category = input.category;
						const includeBuiltin = input.include_builtin !== false;
						const page = clampPage(input.page);
						const pageSize = clampPageSize(input.page_size);

						const allSteps = Object.entries(deps.customSteps)
							.filter(([, def]) => !def.deprecated && !def.hidden && !def.mine)
							.filter(([, def]) => includeBuiltin || !def.builtin)
							.map(([name, def]) => ({
								step: name,
								category: STEP_CATEGORY_MAP[name] || 'other',
								builtin: Boolean(def.builtin),
								description: truncateText(def.description || '', 80),
								vars: (def.vars || []).slice(0, 6).map(v => ({
									name: v.name,
									...(v.required ? { required: true } : {}),
									...(v.type && v.type !== 'text' ? { type: v.type } : {})
								}))
							}));

						const matches = allSteps.filter(item => {
							if (category && item.category !== category) {
								return false;
							}
							if (!query) {
								return true;
							}
							const inName = item.step.toLowerCase().includes(query);
							const inDesc = item.description.toLowerCase().includes(query);
							const inVars = item.vars.some(v => v.name.toLowerCase().includes(query));
							return inName || inDesc || inVars;
						});

						if (matches.length === 0) {
							const withoutCategory = category
								? allSteps.filter(item =>
									!query ||
									item.step.toLowerCase().includes(query) ||
									item.description.toLowerCase().includes(query)
								).length
								: 0;
							return fitWithinBudget({
								page: 1,
								page_size: pageSize,
								total_count: 0,
								total_pages: 0,
								items: [],
								categories: STEP_CATEGORIES.map(c => c.id),
								suggestion: withoutCategory > 0
									? `No matches in category "${category}", but ${withoutCategory} match across other categories. Retry without the category filter.`
									: 'Broaden the search keywords or omit query to browse steps by category.'
							});
						}

						const totalCount = matches.length;
						const totalPages = Math.ceil(totalCount / pageSize);
						const safePage = Math.min(page, totalPages);
						const start = (safePage - 1) * pageSize;
						const pageItems = matches.slice(start, start + pageSize);

						const categoryCounts: Record<string, number> = {};
						for (const item of matches) {
							categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
						}

						return fitWithinBudget({
							page: safePage,
							page_size: pageSize,
							total_count: totalCount,
							total_pages: totalPages,
							facets: categoryCounts,
							items: pageItems
						});
					} catch (err) {
						return makeError(
							`Could not search steps: ${(err as Error).message}`,
							'SEARCH_STEPS_FAILED',
							true
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 2. list_examples (trusted built-in examples query)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'list_examples',
				description:
					'Lists starter blueprint templates with their titles, slugs, and step counts. Use when the user wants inspiration or a pre-built starting blueprint to load.',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'Optional keyword to filter example titles or slugs'
						},
						page: {
							type: 'integer',
							minimum: 1,
							description: 'Page number starting at 1'
						},
						page_size: {
							type: 'integer',
							minimum: 1,
							maximum: 12,
							description: 'Number of examples per page (up to 12)'
						}
					}
				},
				annotations: {
					readOnlyHint: true
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const query = (input.query || '').trim().toLowerCase();
						const page = clampPage(input.page);
						const pageSize = clampPageSize(input.page_size);

						const allExamples = Object.values(examplesMap).map(ex => ({
							slug: ex.slug,
							title: truncateText(ex.title, 60),
							step_count: ex.steps.length,
							steps: ex.steps.slice(0, 4).map(s => s.step)
						}));

						const matches = query
							? allExamples.filter(ex =>
								ex.title.toLowerCase().includes(query) ||
								ex.slug.toLowerCase().includes(query) ||
								ex.steps.some(s => s.toLowerCase().includes(query))
							)
							: allExamples;

						if (matches.length === 0) {
							return fitWithinBudget({
								page: 1,
								page_size: pageSize,
								total_count: 0,
								total_pages: 0,
								items: [],
								suggestion: 'No matching examples found. Retry without a query to browse all starter templates.'
							});
						}

						const totalCount = matches.length;
						const totalPages = Math.ceil(totalCount / pageSize);
						const safePage = Math.min(page, totalPages);
						const start = (safePage - 1) * pageSize;

						return fitWithinBudget({
							page: safePage,
							page_size: pageSize,
							total_count: totalCount,
							total_pages: totalPages,
							items: matches.slice(start, start + pageSize)
						});
					} catch (err) {
						return makeError(
							`Could not list examples: ${(err as Error).message}`,
							'LIST_EXAMPLES_FAILED',
							true
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 3. get_blueprint_state (reads user-authored workspace data -> untrustedContentHint)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'get_blueprint_state',
				description:
					'Reads the active blueprint workspace including its title, ordered steps with indices and values, active settings, and manual-edit status. Use before editing, reordering, or removing existing steps.',
				inputSchema: {
					type: 'object',
					properties: {
						page: {
							type: 'integer',
							minimum: 1,
							description: 'Page number for the steps list starting at 1'
						},
						page_size: {
							type: 'integer',
							minimum: 1,
							maximum: 12,
							description: 'Number of steps per page (up to 12)'
						}
					}
				},
				annotations: {
					readOnlyHint: true,
					untrustedContentHint: true
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const page = clampPage(input.page);
						const pageSize = clampPageSize(input.page_size);
						const stepElements = getWorkspaceStepElements(deps.blueprintSteps);
						const allSteps = stepElements.map((el, index) => {
							const data = extractStepDataFromElement(el);
							return {
								index,
								step: data.step,
								...(data.count ? { count: data.count } : {}),
								vars: summarizeStepVars(data.vars)
							};
						});

						const totalCount = allSteps.length;
						const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
						const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
						const start = (safePage - 1) * pageSize;

						return fitWithinBudget({
							manual_edit_mode: isManualEditMode.value,
							has_github_urls: hasGitHubUrls({
								blueprintSteps: deps.blueprintSteps,
								customSteps: deps.customSteps
							}),
							settings: readActiveSettings(),
							page: safePage,
							page_size: pageSize,
							total_count: totalCount,
							total_pages: totalPages,
							steps: allSteps.slice(start, start + pageSize)
						});
					} catch (err) {
						return makeError(
							`Could not read active blueprint state: ${(err as Error).message}`,
							'GET_STATE_FAILED',
							true
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 4. update_blueprint_steps (batched polymorphic mutation, routine -> omit annotations)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'update_blueprint_steps',
				description:
					"Adds, updates, removes, or reorders one or more steps in the active blueprint workspace and recompiles it. Use when building or modifying a blueprint's step sequence in a single batch.",
				inputSchema: {
					type: 'object',
					properties: {
						operations: {
							type: 'array',
							minItems: 1,
							description: 'Ordered list of step changes to apply',
							items: {
								type: 'object',
								properties: {
									action: {
										type: 'string',
										enum: ['add', 'update', 'remove', 'move'],
										description: 'Change to perform on a step'
									},
									step: {
										type: 'string',
										description: 'Step name from search_steps (required for add)'
									},
									index: {
										type: 'integer',
										minimum: 0,
										description: 'Zero-based position of an existing step (for update, remove, move, or insert position)'
									},
									to_index: {
										type: 'integer',
										minimum: 0,
										description: 'Target zero-based position (required for move)'
									},
									vars: {
										type: 'object',
										description: 'Step variable values keyed by variable name'
									},
									count: {
										type: 'integer',
										minimum: 1,
										description: 'Repeat count for steps that support multiple executions'
									}
								},
								required: ['action']
							}
						},
						force: {
							type: 'boolean',
							description: 'Set true only after user confirmation to exit manual JSON edit mode'
						}
					},
					required: ['operations']
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						if (!Array.isArray(input.operations) || input.operations.length === 0) {
							return makeError(
								'Provide at least one step operation.',
								'INVALID_OPERATIONS',
								true,
								'Specify one or more add, update, remove, or move operations.'
							);
						}

						if (isManualEditMode.value && !input.force) {
							return makeError(
								'The blueprint is currently in manual JSON edit mode; modifying steps would overwrite manual edits.',
								'MANUAL_EDIT_ACTIVE',
								true,
								'Ask the user whether to discard manual JSON edits and resume auto-compilation, then retry with force: true.'
							);
						}

						// Validate step names for add operations before mutating
						for (const op of input.operations) {
							if (op.action === 'add') {
								const def = op.step ? deps.customSteps[op.step] : undefined;
								if (!op.step || !def || def.deprecated || def.hidden) {
									return makeError(
										`Unknown or unavailable step "${op.step || ''}".`,
										'UNKNOWN_STEP',
										true,
										'Call search_steps to find an active step name and its variables.'
									);
								}
							}
						}

						if (isManualEditMode.value && input.force) {
							isManualEditMode.value = false;
						}

						const applied: string[] = [];

						for (const op of input.operations) {
							const currentSteps = getWorkspaceStepElements(deps.blueprintSteps);

							if (op.action === 'add') {
								const stepData: StepData = {
									step: op.step!,
									...(op.vars ? { vars: op.vars as Record<string, any> } : {}),
									...(op.count ? { count: op.count } : {})
								};
								const missing = createAndPopulateStep(stepData, deps.blueprintSteps);
								if (missing) {
									return makeError(
										`Step "${missing}" is not available in the step library.`,
										'STEP_NOT_FOUND',
										false,
										'Call search_steps to choose an available step.'
									);
								}
								if (typeof op.index === 'number' && op.index >= 0 && op.index < currentSteps.length) {
									const updatedSteps = getWorkspaceStepElements(deps.blueprintSteps);
									const newlyAdded = updatedSteps[updatedSteps.length - 1];
									if (newlyAdded && currentSteps[op.index]) {
										deps.blueprintSteps.insertBefore(newlyAdded, currentSteps[op.index]);
									}
								}
								applied.push(`added ${op.step}`);
							} else if (op.action === 'update') {
								if (typeof op.index !== 'number' || !currentSteps[op.index]) {
									return makeError(
										`No step exists at index ${op.index}.`,
										'INVALID_INDEX',
										true,
										'Call get_blueprint_state to inspect valid zero-based step indices.'
									);
								}
								const target = currentSteps[op.index];
								const stepData: StepData = {
									step: target.dataset.step || '',
									...(op.vars ? { vars: op.vars as Record<string, any> } : {}),
									...(op.count ? { count: op.count } : {})
								};
								populateStepVariables(target, stepData);
								applied.push(`updated #${op.index} (${stepData.step})`);
							} else if (op.action === 'remove') {
								if (typeof op.index !== 'number' || !currentSteps[op.index]) {
									return makeError(
										`No step exists at index ${op.index}.`,
										'INVALID_INDEX',
										true,
										'Call get_blueprint_state to inspect valid zero-based step indices.'
									);
								}
								const target = currentSteps[op.index];
								const stepName = target.dataset.step || 'step';
								target.remove();
								applied.push(`removed #${op.index} (${stepName})`);
							} else if (op.action === 'move') {
								if (
									typeof op.index !== 'number' ||
									typeof op.to_index !== 'number' ||
									!currentSteps[op.index] ||
									op.to_index < 0 ||
									op.to_index >= currentSteps.length
								) {
									return makeError(
										`Cannot move step from index ${op.index} to ${op.to_index}.`,
										'INVALID_INDEX',
										true,
										'Call get_blueprint_state to inspect valid zero-based step indices.'
									);
								}
								const moving = currentSteps[op.index];
								const targetSibling = currentSteps[op.to_index];
								if (op.index < op.to_index) {
									deps.blueprintSteps.insertBefore(moving, targetSibling.nextSibling);
								} else {
									deps.blueprintSteps.insertBefore(moving, targetSibling);
								}
								applied.push(`moved ${moving.dataset.step} ${op.index}->${op.to_index}`);
							}
						}

						blueprintEventBus.emit('blueprint:updated');
						await waitForUiSync();

						const finalSteps = getWorkspaceStepElements(deps.blueprintSteps).map((el, idx) => ({
							index: idx,
							step: el.dataset.step || ''
						}));

						return fitWithinBudget({
							status: 'updated',
							applied,
							step_count: finalSteps.length,
							steps: finalSteps.slice(0, DEFAULT_PAGE_SIZE)
						});
					} catch (err) {
						return makeError(
							`Could not update blueprint steps: ${(err as Error).message}`,
							'UPDATE_STEPS_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 5. update_blueprint_settings (routine mutation -> omit annotations)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'update_blueprint_settings',
				description:
					'Updates runtime and compilation settings for the active blueprint and recompiles it. Use when changing WordPress or PHP versions, blueprint title, v1 or v2 format, display mode, storage, or WP-CLI preloading.',
				inputSchema: {
					type: 'object',
					properties: {
						title: {
							type: 'string',
							description: 'Human-readable title for the blueprint'
						},
						wp_version: {
							type: 'string',
							enum: ['latest', '6.4', '6.5', '6.6', 'beta', 'nightly'],
							description: 'WordPress version to run'
						},
						php_version: {
							type: 'string',
							enum: ['latest', '7.4', '8.0', '8.1', '8.2', '8.3'],
							description: 'PHP version to run'
						},
						blueprint_version: {
							type: 'string',
							enum: ['v1', 'v2'],
							description: 'Compiled blueprint schema format'
						},
						display_mode: {
							type: 'string',
							enum: ['browser-full-screen', 'browser', 'seamless'],
							description: 'Playground browser wrapper style'
						},
						storage: {
							type: 'string',
							enum: ['none', 'browser', 'device'],
							description: 'Persistence mode for site changes'
						},
						networking: {
							type: 'boolean',
							description: 'Enable outbound networking for plugin and theme installs'
						},
						preload_wp_cli: {
							type: 'boolean',
							description: 'Preload the WP-CLI extra library'
						},
						encoding_format: {
							type: 'string',
							enum: ['auto', 'hash', 'base64'],
							description: 'How the blueprint is encoded into Playground URLs'
						},
						site_slug: {
							type: 'string',
							description: 'Lowercase alphanumeric slug with hyphens for saving the site in Playground'
						},
						exclude_meta: {
							type: 'boolean',
							description: 'Omit metadata headers from the compiled blueprint'
						},
						force: {
							type: 'boolean',
							description: 'Set true only after user confirmation to exit manual JSON edit mode'
						}
					}
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						if (isManualEditMode.value && !input.force) {
							return makeError(
								'The blueprint is in manual JSON edit mode; changing settings requires resuming auto-compilation.',
								'MANUAL_EDIT_ACTIVE',
								true,
								'Ask the user whether to exit manual edit mode, then retry with force: true.'
							);
						}

						if (typeof input.site_slug === 'string' && input.site_slug !== '' && !/^[a-z0-9][a-z0-9-]+$/.test(input.site_slug)) {
							return makeError(
								`Invalid site slug "${input.site_slug}".`,
								'INVALID_SITE_SLUG',
								true,
								'Use lowercase letters, numbers, and hyphens starting with a letter or number (at least 2 characters).'
							);
						}

						if (isManualEditMode.value && input.force) {
							isManualEditMode.value = false;
						}

						if (input.title !== undefined) {
							setElementValue(document.getElementById('title') as HTMLInputElement | null, input.title);
						}
						if (input.wp_version !== undefined) {
							setElementValue(document.getElementById('wp-version') as HTMLSelectElement | null, input.wp_version);
						}
						if (input.php_version !== undefined) {
							setElementValue(document.getElementById('php-version') as HTMLSelectElement | null, input.php_version);
						}
						if (input.blueprint_version !== undefined) {
							const radio = document.querySelector(
								`input[name="blueprint-version"][value="${input.blueprint_version}"]`
							) as HTMLInputElement | null;
							if (radio) {
								radio.checked = true;
							}
						}
						if (input.display_mode !== undefined) {
							setElementValue(document.getElementById('mode') as HTMLSelectElement | null, input.display_mode);
						}
						if (input.storage !== undefined) {
							setElementValue(document.getElementById('storage') as HTMLSelectElement | null, input.storage);
						}
						if (input.networking !== undefined) {
							const el = document.getElementById('networking') as HTMLInputElement | null;
							if (el) el.checked = input.networking;
						}
						if (input.preload_wp_cli !== undefined) {
							const el = document.getElementById('wp-cli') as HTMLInputElement | null;
							if (el) el.checked = input.preload_wp_cli;
						}
						if (input.encoding_format !== undefined) {
							setElementValue(document.getElementById('encoding-format') as HTMLSelectElement | null, input.encoding_format);
						}
						if (input.site_slug !== undefined) {
							setElementValue(document.getElementById('autosave') as HTMLInputElement | null, input.site_slug);
						}
						if (input.exclude_meta !== undefined) {
							const el = document.getElementById('exclude-meta') as HTMLInputElement | null;
							if (el) el.checked = input.exclude_meta;
						}

						blueprintEventBus.emit('blueprint:updated');
						await waitForUiSync();

						return fitWithinBudget({
							status: 'updated',
							settings: readActiveSettings()
						});
					} catch (err) {
						return makeError(
							`Could not update blueprint settings: ${(err as Error).message}`,
							'UPDATE_SETTINGS_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 6. load_example_blueprint (mutates workspace with unsaved-work guard -> omit annotations)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'load_example_blueprint',
				description:
					'Loads a pre-built example blueprint into the active workspace and recompiles it. Use when the user picks a starter template from the examples list.',
				inputSchema: {
					type: 'object',
					properties: {
						example: {
							type: 'string',
							description: 'Example slug or exact title from list_examples'
						},
						force: {
							type: 'boolean',
							description: 'Set true only after user confirmation to replace existing workspace steps'
						}
					},
					required: ['example']
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const needle = (input.example || '').trim();
						const match =
							examplesSlugMap[needle.toLowerCase()] ||
							examplesMap[needle] ||
							Object.values(examplesMap).find(
								ex => ex.title.toLowerCase() === needle.toLowerCase() || ex.slug.toLowerCase() === needle.toLowerCase()
							);

						if (!match) {
							return makeError(
								`Example "${needle}" was not found.`,
								'EXAMPLE_NOT_FOUND',
								true,
								'Call list_examples to find a valid example slug or title.'
							);
						}

						const existingCount = getWorkspaceStepElements(deps.blueprintSteps).length;
						if ((existingCount > 0 || isManualEditMode.value) && !input.force) {
							return makeError(
								`The active workspace already has ${existingCount} step(s). Loading "${match.title}" will replace them.`,
								'WORKSPACE_NOT_EMPTY',
								true,
								'Ask the user to confirm replacing the current workspace, then retry with force: true.'
							);
						}

						isManualEditMode.value = false;
						deps.restoreExample(match);
						await waitForUiSync();

						return fitWithinBudget({
							status: 'loaded',
							slug: match.slug,
							title: match.title,
							step_count: getWorkspaceStepElements(deps.blueprintSteps).length
						});
					} catch (err) {
						return makeError(
							`Could not load example blueprint: ${(err as Error).message}`,
							'LOAD_EXAMPLE_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 7. clear_blueprint (irreversible wipe of active workspace -> consequentialHint: true)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'clear_blueprint',
				description:
					'Removes all steps and clears the title from the active blueprint workspace. Use only when the user explicitly asks to wipe or start over from an empty blueprint.',
				inputSchema: {
					type: 'object',
					properties: {}
				},
				annotations: {
					consequentialHint: true
				},
				async execute(_input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const removedCount = getWorkspaceStepElements(deps.blueprintSteps).length;
						isManualEditMode.value = false;
						setElementValue(document.getElementById('title') as HTMLInputElement | null, '');
						deps.blueprintSteps.textContent = '';
						const draghint = document.createElement('div');
						draghint.id = 'draghint';
						draghint.textContent = 'Click or drag the steps to add them here.';
						deps.blueprintSteps.appendChild(draghint);
						setElementValue(document.getElementById('examples') as HTMLSelectElement | null, 'Examples');

						blueprintEventBus.emit('blueprint:updated');
						await waitForUiSync();

						return {
							status: 'cleared',
							removed_steps: removedCount
						};
					} catch (err) {
						return makeError(
							`Could not clear blueprint: ${(err as Error).message}`,
							'CLEAR_BLUEPRINT_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 8. set_preview_mode (UI view/layout change -> omit annotations)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'set_preview_mode',
				description:
					'Toggles or repositions the embedded WordPress Playground live preview pane. Use when the user asks to show, move, or hide the live preview.',
				inputSchema: {
					type: 'object',
					properties: {
						position: {
							type: 'string',
							enum: ['off', 'bottom', 'right'],
							description: 'Where to place the live preview pane'
						}
					},
					required: ['position']
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const selectValue = input.position === 'off' ? '' : input.position;
						setElementValue(document.getElementById('preview-mode') as HTMLSelectElement | null, selectValue);
						deps.transformJson();
						await waitForUiSync();

						return {
							status: 'updated',
							preview_mode: input.position
						};
					} catch (err) {
						return makeError(
							`Could not update live preview mode: ${(err as Error).message}`,
							'PREVIEW_MODE_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 9. get_blueprint_output (compiled JSON / URLs / AI instructions -> readOnlyHint + untrustedContentHint)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'get_blueprint_output',
				description:
					'Retrieves the compiled WordPress Playground blueprint JSON, shareable launch and redirect URLs, or a branch-testing AI instructions snippet. Use when the user wants to inspect, copy, or share the compiled result.',
				inputSchema: {
					type: 'object',
					properties: {
						format: {
							type: 'string',
							enum: ['json', 'urls', 'ai_instructions'],
							description: 'Output representation to retrieve'
						},
						url_type: {
							type: 'string',
							enum: ['step-library', 'playground-hash', 'playground-data'],
							description: 'Link style when generating AI instructions (defaults to step-library)'
						},
						offset: {
							type: 'integer',
							minimum: 0,
							description: 'Character offset for reading long JSON or snippet output'
						},
						limit: {
							type: 'integer',
							minimum: 100,
							maximum: 1200,
							description: 'Maximum characters to return per chunk (up to 1200)'
						}
					},
					required: ['format']
				},
				annotations: {
					readOnlyHint: true,
					untrustedContentHint: true
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const stepCount = getWorkspaceStepElements(deps.blueprintSteps).length;
						const offset = typeof input.offset === 'number' && input.offset >= 0 ? Math.floor(input.offset) : 0;
						const limit = typeof input.limit === 'number' && input.limit >= 100
							? Math.min(MAX_CHUNK_LIMIT, Math.floor(input.limit))
							: MAX_CHUNK_LIMIT;

						if (input.format === 'json') {
							const compiled = deps.getBlueprintValue() || '{}';
							const chunk = compiled.slice(offset, offset + limit);
							const nextOffset = offset + chunk.length;
							const truncated = nextOffset < compiled.length;

							return fitWithinBudget({
								format: 'json',
								step_count: stepCount,
								offset,
								length: chunk.length,
								total_length: compiled.length,
								truncated,
								...(truncated ? { next_offset: nextOffset } : {}),
								content: chunk
							});
						}

						if (stepCount === 0 && !isManualEditMode.value) {
							return makeError(
								'The active blueprint has no steps yet.',
								'EMPTY_BLUEPRINT',
								false,
								'Add steps with update_blueprint_steps or load an example before exporting URLs or AI instructions.'
							);
						}

						if (input.format === 'urls') {
							const playgroundLink = document.getElementById('playground-link') as HTMLAnchorElement | null;
							const playgroundUrl = playgroundLink?.href || '';
							const urlDeps = {
								blueprintSteps: deps.blueprintSteps,
								customSteps: deps.customSteps
							};
							const redirectUrl = generateRedirectUrl(1, true, urlDeps) || '';
							const shareUrl = generateRedirectUrl(1, false, urlDeps) || '';

							const playgroundUrlTooLong = playgroundUrl.length > 600;
							return fitWithinBudget({
								format: 'urls',
								playground_url: playgroundUrlTooLong ? truncateText(playgroundUrl, 300) : playgroundUrl,
								playground_url_length: playgroundUrl.length,
								...(playgroundUrlTooLong ? { playground_url_truncated: true } : {}),
								share_url: truncateText(shareUrl, 450),
								redirect_url: truncateText(redirectUrl, 450)
							});
						}

						if (input.format === 'ai_instructions') {
							const aiDeps = {
								blueprintSteps: deps.blueprintSteps,
								customSteps: deps.customSteps
							};
							if (!hasGitHubUrls(aiDeps)) {
								return makeError(
									'No GitHub plugin or theme URLs were found in the current blueprint.',
									'MISSING_GITHUB_URL',
									false,
									'Search for gitPlugin, gitTheme, or installPlugin steps and ask the user which GitHub repository URL to add.'
								);
							}
							const urlType: AIInstructionsUrlType = input.url_type || 'step-library';
							const markdown = generateAIInstructions(aiDeps, urlType);
							if (!markdown) {
								return makeError(
									'Could not generate AI instructions for the current blueprint.',
									'AI_INSTRUCTIONS_FAILED',
									false
								);
							}
							const chunk = markdown.slice(offset, offset + limit);
							const nextOffset = offset + chunk.length;
							const truncated = nextOffset < markdown.length;

							return fitWithinBudget({
								format: 'ai_instructions',
								url_type: urlType,
								offset,
								length: chunk.length,
								total_length: markdown.length,
								truncated,
								...(truncated ? { next_offset: nextOffset } : {}),
								content: chunk
							});
						}

						return makeError(
							`Unsupported output format "${String(input.format)}".`,
							'INVALID_FORMAT',
							true
						);
					} catch (err) {
						return makeError(
							`Could not retrieve blueprint output: ${(err as Error).message}`,
							'GET_OUTPUT_FAILED',
							true
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 10. list_saved_blueprints (reads user-authored saved entries -> readOnlyHint + untrustedContentHint)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'list_saved_blueprints',
				description:
					'Searches and lists blueprints saved in My Blueprints, optionally including saved personal steps. Use when looking up previously saved work to restore, rename, or delete.',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'Optional keyword matching saved blueprint titles'
						},
						include_personal_steps: {
							type: 'boolean',
							description: 'Also summarize saved personal steps'
						},
						page: {
							type: 'integer',
							minimum: 1,
							description: 'Page number starting at 1'
						},
						page_size: {
							type: 'integer',
							minimum: 1,
							maximum: 12,
							description: 'Number of saved blueprints per page (up to 12)'
						}
					}
				},
				annotations: {
					readOnlyHint: true,
					untrustedContentHint: true
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						const query = (input.query || '').trim().toLowerCase();
						const page = clampPage(input.page);
						const pageSize = clampPageSize(input.page_size);

						const history = getHistory();
						const filtered = query
							? history.filter(entry => (entry.title || '').toLowerCase().includes(query))
							: history;

						const personalSteps = input.include_personal_steps
							? Object.keys(getMySteps()).slice(0, 12).map(name => truncateText(name, 40))
							: undefined;

						if (filtered.length === 0) {
							return fitWithinBudget({
								page: 1,
								page_size: pageSize,
								total_count: 0,
								total_pages: 0,
								items: [],
								...(personalSteps ? { personal_steps: personalSteps } : {}),
								suggestion: query
									? 'No saved blueprints matched that query. Retry with a shorter keyword or omit query to list all saved blueprints.'
									: 'No saved blueprints yet. Use save_blueprint to save the current blueprint.'
							});
						}

						const totalCount = filtered.length;
						const totalPages = Math.ceil(totalCount / pageSize);
						const safePage = Math.min(page, totalPages);
						const start = (safePage - 1) * pageSize;

						const items = filtered.slice(start, start + pageSize).map((entry: BlueprintHistoryEntry) => ({
							id: entry.id,
							title: truncateText(entry.title || 'Untitled', 60),
							date: entry.date,
							step_count: Array.isArray(entry.stepConfig?.steps) ? entry.stepConfig.steps.length : 0
						}));

						return fitWithinBudget({
							page: safePage,
							page_size: pageSize,
							total_count: totalCount,
							total_pages: totalPages,
							items,
							...(personalSteps ? { personal_steps: personalSteps } : {})
						});
					} catch (err) {
						return makeError(
							`Could not list saved blueprints: ${(err as Error).message}`,
							'LIST_SAVED_FAILED',
							true
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 11. save_blueprint (save or rename saved blueprint, routine with conflict guard -> omit annotations)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'save_blueprint',
				description:
					"Saves the active blueprint into My Blueprints or renames an existing saved blueprint. Use when the user wants to bookmark their current setup or change a saved blueprint's title.",
				inputSchema: {
					type: 'object',
					properties: {
						title: {
							type: 'string',
							description: 'Title to save under (defaults to the current blueprint title or an auto-generated name)'
						},
						overwrite: {
							type: 'boolean',
							description: 'Set true only after user confirmation to replace an existing entry with the same title'
						},
						rename_from_id: {
							type: 'integer',
							description: 'Existing saved blueprint ID to rename instead of creating a new entry'
						}
					}
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						if (typeof input.rename_from_id === 'number') {
							const newTitle = (input.title || '').trim();
							if (!newTitle) {
								return makeError(
									'A new title is required when renaming a saved blueprint.',
									'MISSING_TITLE',
									true,
									'Provide a non-empty title.'
								);
							}
							const target = getBlueprintFromHistory(input.rename_from_id);
							if (!target) {
								return makeError(
									`Saved blueprint with ID ${input.rename_from_id} was not found.`,
									'NOT_FOUND',
									true,
									'Call list_saved_blueprints to get valid saved blueprint IDs.'
								);
							}
							const renamed = renameBlueprintInHistory(input.rename_from_id, newTitle);
							if (!renamed) {
								return makeError('Could not rename saved blueprint.', 'RENAME_FAILED', false);
							}
							deps.onHistoryChanged?.();
							await waitForUiSync();

							return {
								status: 'renamed',
								id: input.rename_from_id,
								title: newTitle
							};
						}

						const stepConfig = deps.captureCurrentSteps();
						const rawJson = deps.getBlueprintValue();
						let compiledBlueprint: unknown;
						try {
							compiledBlueprint = rawJson ? JSON.parse(rawJson) : {};
						} catch {
							return makeError(
								'The compiled blueprint contains invalid JSON and cannot be saved.',
								'INVALID_BLUEPRINT_JSON',
								false,
								'Fix syntax errors in the blueprint before saving.'
							);
						}

						if (stepConfig.steps.length === 0 && !isManualEditMode.value) {
							return makeError(
								'Cannot save an empty blueprint.',
								'EMPTY_BLUEPRINT',
								false,
								'Add at least one step before saving.'
							);
						}

						const currentTitle = (document.getElementById('title') as HTMLInputElement | null)?.value?.trim() || '';
						const resolvedTitle = (input.title || '').trim() || currentTitle || generateLabel();
						const history = getHistory();
						const conflict = history.find(entry => entry.title.toLowerCase() === resolvedTitle.toLowerCase());

						if (conflict && !input.overwrite) {
							return makeError(
								`A saved blueprint named "${conflict.title}" already exists.`,
								'NAME_CONFLICT',
								true,
								'Ask the user whether to overwrite the existing saved blueprint (retry with overwrite: true) or save under a different title.',
								{ existing_id: conflict.id }
							);
						}

						if (conflict && input.overwrite) {
							const filtered = history.filter(entry => entry.id !== conflict.id);
							saveHistory(filtered);
						}

						const savedId = addBlueprintToHistoryWithId(compiledBlueprint, stepConfig, resolvedTitle);
						deps.onHistoryChanged?.();
						await waitForUiSync();

						if (savedId === null) {
							return {
								status: 'unchanged',
								title: resolvedTitle,
								message: 'An identical blueprint is already the most recent saved entry.'
							};
						}

						return {
							status: conflict ? 'overwritten' : 'saved',
							id: savedId,
							title: resolvedTitle
						};
					} catch (err) {
						return makeError(
							`Could not save blueprint: ${(err as Error).message}`,
							'SAVE_BLUEPRINT_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 12. restore_saved_blueprint (loads saved blueprint into workspace with unsaved-work guard -> omit annotations)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'restore_saved_blueprint',
				description:
					'Loads a saved blueprint from My Blueprints back into the active workspace. Use when the user wants to resume working on a previously saved blueprint.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'integer',
							description: 'Saved blueprint ID from list_saved_blueprints'
						},
						title: {
							type: 'string',
							description: 'Saved blueprint title when ID is not yet known'
						},
						force: {
							type: 'boolean',
							description: 'Set true only after user confirmation to discard unsaved steps in the workspace'
						}
					}
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						let entry: BlueprintHistoryEntry | null = null;

						if (typeof input.id === 'number') {
							entry = getBlueprintFromHistory(input.id);
						} else if (typeof input.title === 'string' && input.title.trim()) {
							const needle = input.title.trim().toLowerCase();
							const matches = getHistory().filter(item => (item.title || '').toLowerCase() === needle);
							if (matches.length > 1) {
								return makeError(
									`Multiple saved blueprints match the title "${input.title.trim()}".`,
									'AMBIGUOUS_TITLE',
									true,
									'Ask the user which entry to restore, then retry with its specific id.',
									{ matching_ids: matches.slice(0, 5).map(m => ({ id: m.id, date: m.date })) }
								);
							}
							entry = matches[0] || null;
						} else {
							return makeError(
								'Provide a saved blueprint id or title to restore.',
								'MISSING_IDENTIFIER',
								true,
								'Call list_saved_blueprints first to locate the desired entry.'
							);
						}

						if (!entry) {
							return makeError(
								'Saved blueprint not found.',
								'NOT_FOUND',
								true,
								'Call list_saved_blueprints to verify available saved blueprints.'
							);
						}

						const existingCount = getWorkspaceStepElements(deps.blueprintSteps).length;
						if (existingCount > 0 && !deps.isBlueprintAlreadySaved() && !input.force) {
							return makeError(
								`The active workspace has ${existingCount} unsaved step(s). Restoring "${entry.title}" will discard them.`,
								'UNSAVED_CHANGES',
								true,
								'Ask the user whether to save or discard current steps, then retry with force: true.'
							);
						}

						deps.restoreSteps(entry.stepConfig, entry.title);
						await waitForUiSync();

						return fitWithinBudget({
							status: 'restored',
							id: entry.id,
							title: truncateText(entry.title, 60),
							step_count: getWorkspaceStepElements(deps.blueprintSteps).length
						});
					} catch (err) {
						return makeError(
							`Could not restore saved blueprint: ${(err as Error).message}`,
							'RESTORE_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	// 13. delete_saved_blueprints (permanent batch deletion -> consequentialHint: true)
	safeRegister(
		modelContext.registerTool(
			{
				name: 'delete_saved_blueprints',
				description:
					'Permanently deletes one or more saved blueprints from My Blueprints. Use only after identifying the target saved blueprint IDs and receiving explicit user confirmation.',
				inputSchema: {
					type: 'object',
					properties: {
						ids: {
							type: 'array',
							minItems: 1,
							items: {
								type: 'integer'
							},
							description: 'One or more saved blueprint IDs from list_saved_blueprints to delete'
						}
					},
					required: ['ids']
				},
				annotations: {
					consequentialHint: true
				},
				async execute(input, { signal }) {
					const aborted = checkAborted(signal);
					if (aborted) return aborted;

					try {
						if (!Array.isArray(input.ids) || input.ids.length === 0) {
							return makeError(
								'Provide at least one saved blueprint ID to delete.',
								'INVALID_IDS',
								true,
								'Call list_saved_blueprints to find saved blueprint IDs.'
							);
						}

						const deletedIds: number[] = [];
						const notFoundIds: number[] = [];

						for (const id of input.ids) {
							const removed = deleteBlueprintFromHistory(id);
							if (removed) {
								deletedIds.push(id);
							} else {
								notFoundIds.push(id);
							}
						}

						if (deletedIds.length === 0) {
							return makeError(
								'None of the specified saved blueprint IDs were found.',
								'NOT_FOUND',
								true,
								'Call list_saved_blueprints to inspect current saved blueprint IDs.',
								{ not_found_ids: notFoundIds }
							);
						}

						deps.onHistoryChanged?.();
						await waitForUiSync();

						return fitWithinBudget({
							status: 'deleted',
							deleted_ids: deletedIds,
							...(notFoundIds.length > 0 ? { not_found_ids: notFoundIds } : {}),
							remaining_count: getHistory().length
						});
					} catch (err) {
						return makeError(
							`Could not delete saved blueprints: ${(err as Error).message}`,
							'DELETE_FAILED',
							false
						);
					}
				}
			},
			registrationOptions
		)
	);

	if (typeof window !== 'undefined') {
		window.addEventListener('pagehide', dispose, { once: true });
	}

	return dispose;
}
