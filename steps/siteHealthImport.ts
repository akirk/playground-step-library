import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';
import {
	parseSiteHealth,
	parseSections,
	parsePluginsFromLines,
	parseThemeFromLines,
	deriveThemeSlug,
	deriveSlugFromName,
	type PluginInfo,
} from '../src/shared/site-health-parser.js';

export interface SiteHealthImportStep extends BlueprintStep {
	vars?: {
		siteHealth: string;
		installPlugins?: boolean;
		installTheme?: boolean;
		installLatest?: boolean;
	};
}

interface ParsedSiteHealthData {
	wpVersion: string | null;
	phpVersion: string | null;
	theme: string | null;
	plugins: string[];
	options: Record<string, string>;
}

/**
 * Query WordPress.org plugins update-check API to map plugin names to slugs.
 * Uses the update-check API which accepts plugin metadata (Name, Author, Version)
 * and returns the correct plugin slug. All plugins are queried in a single API call.
 */
async function mapPluginNamesToSlugs(plugins: PluginInfo[]): Promise<Map<string, string>> {
	const nameToSlug = new Map<string, string>();

	if (!plugins || plugins.length === 0) {
		return nameToSlug;
	}

	try {
		const pluginsData: Record<string, { Name: string; Version: string; Author?: string }> = {};
		const activePlugins: string[] = [];

		plugins.forEach((plugin, index) => {
			const path = `plugin-${index}.php`;
			pluginsData[path] = {
				Name: plugin.name,
				Version: plugin.version || '0.0.0',
			};
			if (plugin.author) {
				pluginsData[path].Author = plugin.author;
			}
			activePlugins.push(path);
		});

		const pluginsPayload = {
			plugins: pluginsData,
			active: activePlugins,
		};

		const formData = new URLSearchParams();
		formData.append('plugins', JSON.stringify(pluginsPayload));
		formData.append('translations', JSON.stringify([]));
		formData.append('locale', JSON.stringify(['en_US']));
		formData.append('all', 'true');

		const response = await fetch('https://api.wordpress.org/plugins/update-check/1.1/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent': 'playground-step-library/1.0',
			},
			body: formData.toString(),
		});

		if (response.ok) {
			const data = await response.json();
			const allPlugins = { ...(data.plugins || {}), ...(data.no_update || {}) };

			activePlugins.forEach((path, index) => {
				const pluginInfo = allPlugins[path];
				if (pluginInfo && pluginInfo.slug) {
					const originalPlugin = plugins[index];
					nameToSlug.set(originalPlugin.name, pluginInfo.slug);
				}
			});
		}
	} catch (error) {
		console.warn('Warning: Could not query WordPress.org plugins update-check API:', error);
	}

	const unmappedPlugins = plugins.filter((plugin) => !nameToSlug.has(plugin.name));

	if (unmappedPlugins.length > 0) {
		const candidateSlugs = unmappedPlugins
			.map((plugin) => ({ plugin, slug: deriveSlugFromName(plugin.name) }))
			.filter(({ slug }) => slug);

		const verificationPromises = candidateSlugs.map(async ({ plugin, slug }) => {
			try {
				const response = await fetch(
					`https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&slug=${encodeURIComponent(slug)}`,
					{
						headers: {
							'User-Agent': 'playground-step-library/1.0',
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					if (data && !data.error && data.slug) {
						return { plugin, slug: data.slug, verified: true };
					}
				}
				return { plugin, slug, verified: false };
			} catch {
				return { plugin, slug, verified: false };
			}
		});

		const results = await Promise.all(verificationPromises);

		for (const { plugin, slug, verified } of results) {
			if (verified) {
				nameToSlug.set(plugin.name, slug);
			} else {
				console.warn(`Could not map plugin "${plugin.name}" to a WordPress.org slug (tried: "${slug}")`);
			}
		}
	}

	return nameToSlug;
}

/**
 * Parse WordPress Site Health data from text content.
 * Based on the cross-fit project's parsing logic.
 */
async function parseSiteHealthContent(content: string): Promise<ParsedSiteHealthData> {
	const data: ParsedSiteHealthData = {
		wpVersion: null,
		phpVersion: null,
		theme: null,
		plugins: [],
		options: {},
	};

	const sections = parseSections(content);

	const coreLines = sections.get('wp-core');
	if (coreLines) {
		for (const line of coreLines) {
			const match = line.match(/^(\w+):\s*(.+)$/);
			if (match) {
				const key = match[1];
				const value = match[2].trim();

				if (key === 'version') {
					data.wpVersion = value;
				} else if (key === 'permalink') {
					data.options.permalink_structure = value;
				} else if (key === 'blog_public') {
					data.options.blog_public = value === '1' ? '1' : '0';
				} else if (key === 'default_comment_status') {
					data.options.default_comment_status = value;
				}
			}
		}
	}

	const serverLines = sections.get('wp-server');
	if (serverLines) {
		for (const line of serverLines) {
			const match = line.match(/^php_version:\s*(.+)$/);
			if (match) {
				const versionStr = match[1].trim();
				const versionMatch = versionStr.match(/^(\d+\.\d+)/);
				if (versionMatch) {
					data.phpVersion = versionMatch[1];
				}
			}
		}
	}

	const themeLines = sections.get('wp-active-theme');
	if (themeLines) {
		const themeInfo = parseThemeFromLines(themeLines);
		const themeSlug = deriveThemeSlug(themeInfo);
		if (themeSlug) {
			data.theme = themeInfo.version ? `${themeSlug}@${themeInfo.version}` : themeSlug;
		}
	}

	const pluginLines = sections.get('wp-plugins-active');
	if (pluginLines) {
		const pluginInfos = parsePluginsFromLines(pluginLines);

		if (pluginInfos.length > 0) {
			const pluginNameToSlug = await mapPluginNamesToSlugs(pluginInfos);

			for (const plugin of pluginInfos) {
				const slug = pluginNameToSlug.get(plugin.name);
				if (slug) {
					const pluginSpec = plugin.version ? `${slug}@${plugin.version}` : slug;
					data.plugins.push(pluginSpec);
				}
			}
		}
	}

	return data;
}

export const siteHealthImport: StepFunction<SiteHealthImportStep> = (step: SiteHealthImportStep): StepResult => {
	const siteHealthContent = step.vars?.siteHealth || '';
	const installPlugins = step.vars?.installPlugins !== false;
	const installTheme = step.vars?.installTheme !== false;
	const installLatest = step.vars?.installLatest === true;

	return {
		toV1() {
			const { theme, plugins } = parseSiteHealth(siteHealthContent, {
				installTheme,
				installPlugins,
				installLatest,
			});

			const steps: any[] = [];

			if (theme) {
				steps.push({
					step: 'installTheme',
					themeData: {
						resource: 'wordpress.org/themes',
						slug: theme,
					},
					options: {
						activate: true,
					},
					progress: {
						caption: `Installing theme: ${theme}`,
					},
				});
			}

			for (const plugin of plugins) {
				steps.push({
					step: 'installPlugin',
					pluginData: {
						resource: 'wordpress.org/plugins',
						slug: plugin,
					},
					options: {
						activate: true,
					},
					progress: {
						caption: `Installing plugin: ${plugin}`,
					},
				});
			}

			return { steps };
		},

		toV2(): BlueprintV2Declaration {
			const { theme, plugins } = parseSiteHealth(siteHealthContent, {
				installTheme,
				installPlugins,
				installLatest,
			});

			const result: BlueprintV2Declaration = { version: 2 };

			if (plugins.length > 0) {
				result.plugins = plugins;
			}

			if (theme) {
				result.themes = [theme];
			}

			return result;
		},
	};
};

siteHealthImport.description = 'Import site configuration from WordPress Site Health info (Tools → Site Health → Info → Copy site info to clipboard).';
siteHealthImport.vars = [
	{
		name: 'siteHealth',
		description: 'Paste the Site Health info text here. Go to Tools → Site Health → Info tab, then click "Copy site info to clipboard".',
		type: 'textarea',
		required: true,
		samples: [''],
	},
	{
		name: 'installPlugins',
		description: 'Install the plugins listed in the Site Health info.',
		type: 'boolean',
		samples: ['true', 'false'],
	},
	{
		name: 'installTheme',
		description: 'Install and activate the theme listed in the Site Health info.',
		type: 'boolean',
		samples: ['true', 'false'],
	},
	{
		name: 'installLatest',
		description: 'Install the latest versions of plugins and theme instead of the exact versions from Site Health.',
		type: 'boolean',
		samples: ['false', 'true'],
	},
];

export { parseSiteHealthContent, mapPluginNamesToSlugs };
