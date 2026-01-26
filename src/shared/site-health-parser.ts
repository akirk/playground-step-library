/**
 * Site Health Parser
 * Shared parsing utilities for WordPress Site Health info
 */

export interface PluginInfo {
	name: string;
	version: string;
	author: string | null;
}

export interface ThemeInfo {
	name: string | null;
	version: string | null;
	path: string | null;
}

export interface ParsedSiteHealth {
	theme: string | null;
	plugins: string[];
}

/**
 * Derive a WordPress slug from a plugin or theme name.
 */
export function deriveSlugFromName(name: string): string {
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
export function parseSections(content: string): Map<string, string[]> {
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
export function parseThemeFromLines(lines: string[]): ThemeInfo {
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
export function deriveThemeSlug(info: ThemeInfo): string | null {
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
export function parsePluginFromLine(line: string): PluginInfo | null {
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
export function parsePluginsFromLines(lines: string[]): PluginInfo[] {
	const plugins: PluginInfo[] = [];
	for (const line of lines) {
		const plugin = parsePluginFromLine(line);
		if (plugin) plugins.push(plugin);
	}
	return plugins;
}

/**
 * Check if text is valid Site Health content.
 */
export function isSiteHealthContent(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}

	const trimmed = text.trim();

	// Site Health info must have ### section markers
	if (!trimmed.includes('### wp-')) {
		return false;
	}

	// Must have at least one of the key sections
	const hasCore = /### wp-core\s*###?/i.test(trimmed);
	const hasPlugins = /### wp-plugins-active/i.test(trimmed);
	const hasTheme = /### wp-active-theme/i.test(trimmed);

	return hasCore || hasPlugins || hasTheme;
}

/**
 * Parse Site Health content and extract theme and plugin slugs.
 */
export function parseSiteHealth(
	content: string,
	options: { installTheme?: boolean; installPlugins?: boolean; installLatest?: boolean } = {}
): ParsedSiteHealth {
	const { installTheme = true, installPlugins = true, installLatest = true } = options;
	const result: ParsedSiteHealth = { theme: null, plugins: [] };

	if (!content.trim()) {
		return result;
	}

	const sections = parseSections(content);

	if (installTheme) {
		const themeLines = sections.get('wp-active-theme');
		if (themeLines) {
			const themeInfo = parseThemeFromLines(themeLines);
			const themeSlug = deriveThemeSlug(themeInfo);
			if (themeSlug) {
				result.theme = installLatest || !themeInfo.version
					? themeSlug
					: `${themeSlug}@${themeInfo.version}`;
			}
		}
	}

	if (installPlugins) {
		const pluginLines = sections.get('wp-plugins-active');
		if (pluginLines) {
			const pluginInfos = parsePluginsFromLines(pluginLines);
			for (const plugin of pluginInfos) {
				const slug = deriveSlugFromName(plugin.name);
				if (slug) {
					const pluginSpec = installLatest || !plugin.version
						? slug
						: `${slug}@${plugin.version}`;
					result.plugins.push(pluginSpec);
				}
			}
		}
	}

	return result;
}
