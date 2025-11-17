export function detectUrlType(url: string): string | null {
	if (!url || typeof url !== 'string') {
		return null;
	}

	const trimmedUrl = url.trim();

	if (/^https?:\/\/wordpress\.org\/plugins\/.+/.test(trimmedUrl)) {
		return 'plugin';
	}
	if (/^https?:\/\/wordpress\.org\/themes\/.+/.test(trimmedUrl)) {
		return 'theme';
	}
	if (/^https?:\/\/github\.com\/.+\/.+/.test(trimmedUrl)) {
		return 'plugin';
	}
	if (/^https?:\/\/.+\.(zip|tar\.gz|tgz)(\?.*)?$/.test(trimmedUrl)) {
		return 'plugin';
	}
	if (/^https?:\/\/.+/.test(trimmedUrl)) {
		return 'plugin';
	}

	return null;
}

export function detectWpAdminUrl(url: string): string | null {
	if (!url || typeof url !== 'string') {
		return null;
	}

	const trimmed = url.trim();

	if (trimmed.startsWith('/wp-admin/') || trimmed.startsWith('/wp-login.php')) {
		return trimmed;
	}

	try {
		const urlObj = new URL(trimmed);
		const path = urlObj.pathname + urlObj.search + urlObj.hash;

		if (path.includes('/wp-admin/') || path.includes('/wp-login.php')) {
			return path;
		}
	} catch (e) {
		return null;
	}

	return null;
}

export function detectHtml(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}

	const trimmed = text.trim();

	return /<[^>]+>/.test(trimmed) && trimmed.includes('</');
}

export function detectPhp(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}

	const trimmed = text.trim();

	return trimmed.startsWith('<?php') || (trimmed.includes('<?php') && trimmed.includes('?>'));
}

export function isPlaygroundDomain(hostname: string): boolean {
	return hostname === 'playground.wordpress.net' || hostname === '127.0.0.1';
}

export function detectPlaygroundUrl(url: string): any {
	if (!url || typeof url !== 'string') {
		return null;
	}

	const trimmed = url.trim();

	try {
		const urlObj = new URL(trimmed);
		if (isPlaygroundDomain(urlObj.hostname) && urlObj.hash && urlObj.hash.length > 1) {
			const hashContent = urlObj.hash.substring(1);
			const blueprintJson = decodeURIComponent(hashContent);
			return JSON.parse(blueprintJson);
		}
	} catch (e) {
		return null;
	}

	return null;
}

export function detectPlaygroundQueryApiUrl(url: string): boolean {
	if (!url || typeof url !== 'string') {
		return false;
	}

	const trimmed = url.trim();

	try {
		const urlObj = new URL(trimmed);
		if (isPlaygroundDomain(urlObj.hostname) && urlObj.search) {
			return true;
		}
	} catch (e) {
		return false;
	}

	return false;
}
