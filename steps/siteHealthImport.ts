import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';

export interface SiteHealthImportStep extends BlueprintStep {
	vars?: {
		siteHealth: string;
		installPlugins?: boolean;
		installTheme?: boolean;
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
		const candidateSlugs: { plugin: PluginInfo; slug: string }[] = [];

		for (const plugin of unmappedPlugins) {
			const candidateSlug = plugin.name
				.split(':')[0]
				.trim()
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, '')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');

			if (candidateSlug) {
				candidateSlugs.push({ plugin, slug: candidateSlug });
			}
		}

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

	const pluginNames: PluginInfo[] = [];

	// Handle leading backtick if present (strip it)
	const cleanContent = content.trim().startsWith('`') ? content.trim().slice(1).trim() : content;
	const sections = cleanContent.split(/^###\s+/m);

	for (const section of sections) {
		if (!section.trim()) continue;

		const lines = section.split('\n');
		const sectionNameRaw = lines[0].trim().replace(/\s*###\s*$/, '');
		// Extract base section name (remove count in parentheses like "(11)")
		const sectionName = sectionNameRaw.split(' ')[0];

		// Parse wp-core section
		if (sectionName === 'wp-core') {
			for (const line of lines.slice(1)) {
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
		if (sectionName === 'wp-server') {
			for (const line of lines.slice(1)) {
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
		if (sectionName === 'wp-active-theme') {
			let themeName: string | null = null;
			let themeVersion: string | null = null;
			let themePath: string | null = null;

			for (const line of lines.slice(1)) {
				const match = line.match(/^(\w+):\s*(.+)$/);
				if (match) {
					const key = match[1];
					const value = match[2].trim();

					if (key === 'name') {
						const slugMatch = value.match(/\(([^)]+)\)$/);
						if (slugMatch) {
							themeName = slugMatch[1];
						} else {
							themeName = value;
						}
					} else if (key === 'version') {
						themeVersion = value;
					} else if (key === 'theme_path') {
						const pathMatch = value.match(/\/([^/]+)\/?$/);
						if (pathMatch) {
							themePath = pathMatch[1];
						}
					}
				}
			}

			// Determine theme slug
			let themeSlug: string | null = null;
			if (themeName && themeName === themeName.toLowerCase() && !themeName.includes(' ')) {
				themeSlug = themeName;
			} else if (themePath) {
				themeSlug = themePath;
			} else if (themeName) {
				themeSlug = themeName.toLowerCase().replace(/\s+/g, '-');
			}

			if (themeSlug) {
				data.theme = themeVersion ? `${themeSlug}@${themeVersion}` : themeSlug;
			}
		}

		// Parse wp-plugins-active section
		if (sectionName === 'wp-plugins-active') {
			for (const line of lines.slice(1)) {
				if (!line.trim()) continue;

				// Format: "Plugin Name: version: X.Y.Z, author: ..." or "Plugin Name: Subtitle: version: X.Y.Z, ..."
				const versionIndex = line.indexOf('version:');
				if (versionIndex === -1) continue;

				const pluginNamePart = line.substring(0, versionIndex).trim();
				const pluginName = pluginNamePart.replace(/\s*:\s*$/, '');

				const versionPart = line.substring(versionIndex + 'version:'.length).trim();
				const versionMatch = versionPart.match(/^([^,]+)/);
				if (!versionMatch) continue;

				const pluginVersion = versionMatch[1].trim();

				// Extract author
				let pluginAuthor: string | null = null;
				const authorIndex = line.indexOf('author:');
				if (authorIndex !== -1) {
					const authorPart = line.substring(authorIndex + 'author:'.length).trim();
					const updatesMatch = authorPart.match(/^(.+?)(?:,\s*(?:Updates|Auto-updates))/);
					if (updatesMatch) {
						pluginAuthor = updatesMatch[1].trim();
					} else {
						pluginAuthor = authorPart.trim();
					}
				}

				pluginNames.push({ name: pluginName, version: pluginVersion, author: pluginAuthor });
			}
		}
	}

	// Query WordPress.org update-check API to map plugin names to slugs
	if (pluginNames.length > 0) {
		const pluginNameToSlug = await mapPluginNamesToSlugs(pluginNames);

		for (const plugin of pluginNames) {
			const slug = pluginNameToSlug.get(plugin.name) ||
				plugin.name.split(':')[0].trim().toLowerCase().replace(/\s+/g, '-');
			const pluginSpec = plugin.version ? `${slug}@${plugin.version}` : slug;
			data.plugins.push(pluginSpec);
		}
	}

	return data;
}

export const siteHealthImport: StepFunction<SiteHealthImportStep> = (step: SiteHealthImportStep): StepResult => {
	const siteHealthContent = step.vars?.siteHealth || '';
	const installPlugins = step.vars?.installPlugins !== false;
	const installTheme = step.vars?.installTheme !== false;

	// We need to parse the content asynchronously, but the step functions are synchronous.
	// Store the content for parsing at runtime via PHP.
	return {
		toV1() {
			if (!siteHealthContent.trim()) {
				return { steps: [] };
			}

			// Parse the site health content synchronously for blueprint generation
			// Note: This simplified version doesn't do the async API lookup for plugin slugs
			// The full implementation would need to be done at runtime
			const steps: any[] = [];

			// Parse the content inline (simplified synchronous parsing)
			const cleanContent = siteHealthContent.trim().startsWith('`')
				? siteHealthContent.trim().slice(1).trim()
				: siteHealthContent;
			const sections = cleanContent.split(/^###\s+/m);

			let theme: string | null = null;
			const plugins: string[] = [];

			for (const section of sections) {
				if (!section.trim()) continue;

				const lines = section.split('\n');
				const sectionNameRaw = lines[0].trim().replace(/\s*###\s*$/, '');
				const sectionName = sectionNameRaw.split(' ')[0];

				// Parse wp-active-theme section
				if (sectionName === 'wp-active-theme' && installTheme) {
					let themeName: string | null = null;
					let themeVersion: string | null = null;
					let themePath: string | null = null;

					for (const line of lines.slice(1)) {
						const match = line.match(/^(\w+):\s*(.+)$/);
						if (match) {
							const key = match[1];
							const value = match[2].trim();

							if (key === 'name') {
								const slugMatch = value.match(/\(([^)]+)\)$/);
								themeName = slugMatch ? slugMatch[1] : value;
							} else if (key === 'version') {
								themeVersion = value;
							} else if (key === 'theme_path') {
								const pathMatch = value.match(/\/([^/]+)\/?$/);
								if (pathMatch) themePath = pathMatch[1];
							}
						}
					}

					let themeSlug: string | null = null;
					if (themeName && themeName === themeName.toLowerCase() && !themeName.includes(' ')) {
						themeSlug = themeName;
					} else if (themePath) {
						themeSlug = themePath;
					} else if (themeName) {
						themeSlug = themeName.toLowerCase().replace(/\s+/g, '-');
					}

					if (themeSlug) {
						theme = themeSlug;
					}
				}

				// Parse wp-plugins-active section
				if (sectionName === 'wp-plugins-active' && installPlugins) {
					for (const line of lines.slice(1)) {
						if (!line.trim()) continue;

						const versionIndex = line.indexOf('version:');
						if (versionIndex === -1) continue;

						const pluginNamePart = line.substring(0, versionIndex).trim();
						const pluginName = pluginNamePart.replace(/\s*:\s*$/, '');

						// Derive slug from name (simplified - full version uses API lookup)
						const slug = pluginName
							.split(':')[0]
							.trim()
							.toLowerCase()
							.replace(/\s+/g, '-')
							.replace(/[^a-z0-9-]/g, '')
							.replace(/-+/g, '-')
							.replace(/^-|-$/g, '');

						if (slug) {
							plugins.push(slug);
						}
					}
				}
			}

			// Add theme installation step
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

			// Add plugin installation steps
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
			if (!siteHealthContent.trim()) {
				return { version: 2 };
			}

			// Parse for v2 blueprint format
			const cleanContent = siteHealthContent.trim().startsWith('`')
				? siteHealthContent.trim().slice(1).trim()
				: siteHealthContent;
			const sections = cleanContent.split(/^###\s+/m);

			let theme: string | null = null;
			const plugins: string[] = [];

			for (const section of sections) {
				if (!section.trim()) continue;

				const lines = section.split('\n');
				const sectionNameRaw = lines[0].trim().replace(/\s*###\s*$/, '');
				const sectionName = sectionNameRaw.split(' ')[0];

				if (sectionName === 'wp-active-theme' && installTheme) {
					let themeName: string | null = null;
					let themePath: string | null = null;

					for (const line of lines.slice(1)) {
						const match = line.match(/^(\w+):\s*(.+)$/);
						if (match) {
							const key = match[1];
							const value = match[2].trim();

							if (key === 'name') {
								const slugMatch = value.match(/\(([^)]+)\)$/);
								themeName = slugMatch ? slugMatch[1] : value;
							} else if (key === 'theme_path') {
								const pathMatch = value.match(/\/([^/]+)\/?$/);
								if (pathMatch) themePath = pathMatch[1];
							}
						}
					}

					if (themeName && themeName === themeName.toLowerCase() && !themeName.includes(' ')) {
						theme = themeName;
					} else if (themePath) {
						theme = themePath;
					} else if (themeName) {
						theme = themeName.toLowerCase().replace(/\s+/g, '-');
					}
				}

				if (sectionName === 'wp-plugins-active' && installPlugins) {
					for (const line of lines.slice(1)) {
						if (!line.trim()) continue;

						const versionIndex = line.indexOf('version:');
						if (versionIndex === -1) continue;

						const pluginNamePart = line.substring(0, versionIndex).trim();
						const pluginName = pluginNamePart.replace(/\s*:\s*$/, '');

						const slug = pluginName
							.split(':')[0]
							.trim()
							.toLowerCase()
							.replace(/\s+/g, '-')
							.replace(/[^a-z0-9-]/g, '')
							.replace(/-+/g, '-')
							.replace(/^-|-$/g, '');

						if (slug) {
							plugins.push(slug);
						}
					}
				}
			}

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
];

// Export the async parsing function for potential use in other contexts
export { parseSiteHealthContent, mapPluginNamesToSlugs };
