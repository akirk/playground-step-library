import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';

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

interface PluginInfo {
	name: string;
	version: string;
	author: string | null;
}

interface ThemeInfo {
	name: string | null;
	version: string | null;
	path: string | null;
}

/**
 * Derive a WordPress slug from a plugin or theme name.
 */
function deriveSlugFromName(name: string): string {
	return name
		.split(':')[0]
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Clean site health content by stripping leading backticks.
 */
function cleanSiteHealthContent(content: string): string {
	const trimmed = content.trim();
	return trimmed.startsWith('`') ? trimmed.slice(1).trim() : trimmed;
}

/**
 * Parse site health content into sections.
 * Returns a map of section name to array of lines.
 */
function parseSections(content: string): Map<string, string[]> {
	const sections = new Map<string, string[]>();
	const cleanContent = cleanSiteHealthContent(content);
	const parts = cleanContent.split(/^###\s+/m);

	for (const part of parts) {
		if (!part.trim()) continue;

		const lines = part.split('\n');
		const sectionNameRaw = lines[0].trim().replace(/\s*###\s*$/, '');
		const sectionName = sectionNameRaw.split(' ')[0];

		sections.set(sectionName, lines.slice(1));
	}

	return sections;
}

/**
 * Parse theme info from wp-active-theme section lines.
 */
function parseThemeFromLines(lines: string[]): ThemeInfo {
	const info: ThemeInfo = { name: null, version: null, path: null };

	for (const line of lines) {
		const match = line.match(/^(\w+):\s*(.+)$/);
		if (!match) continue;

		const key = match[1];
		const value = match[2].trim();

		if (key === 'name') {
			const slugMatch = value.match(/\(([^)]+)\)$/);
			info.name = slugMatch ? slugMatch[1] : value;
		} else if (key === 'version') {
			info.version = value;
		} else if (key === 'theme_path') {
			const pathMatch = value.match(/\/([^/]+)\/?$/);
			if (pathMatch) info.path = pathMatch[1];
		}
	}

	return info;
}

/**
 * Derive theme slug from theme info.
 */
function deriveThemeSlug(info: ThemeInfo): string | null {
	if (info.name && info.name === info.name.toLowerCase() && !info.name.includes(' ')) {
		return info.name;
	}
	if (info.path) {
		return info.path;
	}
	if (info.name) {
		return info.name.toLowerCase().replace(/\s+/g, '-');
	}
	return null;
}

/**
 * Parse a plugin info from a wp-plugins-active line.
 */
function parsePluginFromLine(line: string): PluginInfo | null {
	if (!line.trim()) return null;

	const versionIndex = line.indexOf('version:');
	if (versionIndex === -1) return null;

	const pluginNamePart = line.substring(0, versionIndex).trim();
	const pluginName = pluginNamePart.replace(/\s*:\s*$/, '');

	const versionPart = line.substring(versionIndex + 'version:'.length).trim();
	const versionMatch = versionPart.match(/^([^,]+)/);
	if (!versionMatch) return null;

	const pluginVersion = versionMatch[1].trim();

	let pluginAuthor: string | null = null;
	const authorIndex = line.indexOf('author:');
	if (authorIndex !== -1) {
		const authorPart = line.substring(authorIndex + 'author:'.length).trim();
		const updatesMatch = authorPart.match(/^(.+?)(?:,\s*(?:Updates|Auto-updates))/);
		pluginAuthor = updatesMatch ? updatesMatch[1].trim() : authorPart.trim();
	}

	return { name: pluginName, version: pluginVersion, author: pluginAuthor };
}

/**
 * Parse plugins from wp-plugins-active section lines.
 */
function parsePluginsFromLines(lines: string[]): PluginInfo[] {
	const plugins: PluginInfo[] = [];
	for (const line of lines) {
		const plugin = parsePluginFromLine(line);
		if (plugin) plugins.push(plugin);
	}
	return plugins;
}

interface SyncParsedData {
	theme: string | null;
	plugins: string[];
}

/**
 * Synchronous parsing of site health content for theme and plugin slugs.
 * Used by toV1() and toV2() which cannot be async.
 */
function parseSiteHealthSync(
	content: string,
	options: { installTheme: boolean; installPlugins: boolean; installLatest: boolean }
): SyncParsedData {
	const result: SyncParsedData = { theme: null, plugins: [] };

	if (!content.trim()) {
		return result;
	}

	const sections = parseSections(content);

	if (options.installTheme) {
		const themeLines = sections.get('wp-active-theme');
		if (themeLines) {
			const themeInfo = parseThemeFromLines(themeLines);
			const themeSlug = deriveThemeSlug(themeInfo);
			if (themeSlug) {
				result.theme = options.installLatest || !themeInfo.version
					? themeSlug
					: `${themeSlug}@${themeInfo.version}`;
			}
		}
	}

	if (options.installPlugins) {
		const pluginLines = sections.get('wp-plugins-active');
		if (pluginLines) {
			const pluginInfos = parsePluginsFromLines(pluginLines);
			for (const plugin of pluginInfos) {
				const slug = deriveSlugFromName(plugin.name);
				if (slug) {
					const pluginSpec = options.installLatest || !plugin.version
						? slug
						: `${slug}@${plugin.version}`;
					result.plugins.push(pluginSpec);
				}
			}
		}
	}

	return result;
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
		// Build request body for update-check API
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

	// For plugins not mapped by the update-check API, derive slugs optimistically
	// and verify they exist on WordPress.org before including them
	const unmappedPlugins = plugins.filter((plugin) => !nameToSlug.has(plugin.name));

	if (unmappedPlugins.length > 0) {
		const candidateSlugs = unmappedPlugins
			.map((plugin) => ({ plugin, slug: deriveSlugFromName(plugin.name) }))
			.filter(({ slug }) => slug);

		// Verify each candidate slug exists on WordPress.org
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
					// The API returns an object with 'error' if the plugin doesn't exist
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

	// Parse wp-core section
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

	// Parse wp-server section
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

	// Parse wp-active-theme section
	const themeLines = sections.get('wp-active-theme');
	if (themeLines) {
		const themeInfo = parseThemeFromLines(themeLines);
		const themeSlug = deriveThemeSlug(themeInfo);
		if (themeSlug) {
			data.theme = themeInfo.version ? `${themeSlug}@${themeInfo.version}` : themeSlug;
		}
	}

	// Parse wp-plugins-active section
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
			const { theme, plugins } = parseSiteHealthSync(siteHealthContent, {
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
			const { theme, plugins } = parseSiteHealthSync(siteHealthContent, {
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

// Export the async parsing function for potential use in other contexts
export { parseSiteHealthContent, mapPluginNamesToSlugs };
