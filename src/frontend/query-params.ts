/**
 * Query Parameter Parsing
 * Utilities for parsing URL query parameters into blueprint configuration
 */

import { expandUrl } from './utils';

export interface BlueprintQueryParams {
	steps: Array<{
		step: string;
		vars: Record<string, any>;
	}>;
	redir: number | null;
}

/**
 * Check if the URL has a blueprint-url query parameter
 * Returns the URL string if present, null otherwise
 */
export function getBlueprintUrlParam(): string | null {
	const urlParams = new URLSearchParams(window.location.search);
	const blueprintUrl = urlParams.get('blueprint-url');
	return blueprintUrl ? rewriteGitHubUrlToRaw( blueprintUrl ) : null;
}

/**
 * Rewrite GitHub file URLs to raw.githubusercontent.com URLs so they can be fetched directly.
 */
export function rewriteGitHubUrlToRaw( url: string ): string {
	let parsedUrl: URL;
	try {
		parsedUrl = new URL( url );
	} catch ( e ) {
		return url;
	}

	if ( parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:' ) {
		return url;
	}

	if ( parsedUrl.hostname !== 'github.com' && parsedUrl.hostname !== 'www.github.com' ) {
		return url;
	}

	const pathParts = parsedUrl.pathname.split( '/' ).filter( Boolean );
	const [ owner, repo, fileUrlType, ref, ...filePath ] = pathParts;
	if ( !owner || !repo || !ref || filePath.length === 0 ) {
		return url;
	}

	if ( fileUrlType !== 'blob' && fileUrlType !== 'raw' ) {
		return url;
	}

	return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath.join( '/' )}${parsedUrl.search}`;
}

/**
 * Redirect URLs shorten URL-like values by removing the protocol. Add it back
 * only for values that still look like a URL host, not for plugin/theme slugs.
 */
function expandUrlQueryValue( value: string ): string {
	if ( value.match( /^https?:\/\// ) ) {
		return value;
	}

	const firstPathSegment = value.split( '/' )[0];
	if ( firstPathSegment.includes( '.' ) ) {
		return expandUrl( value );
	}

	return value;
}

/**
 * Parse query parameters into blueprint configuration
 * Supports array-indexed parameters like step[0], step[1], url[0], url[1], etc.
 */
export function parseQueryParamsForBlueprint(): BlueprintQueryParams | null {
	const urlParams = new URLSearchParams(window.location.search);
	const redirParam = urlParams.get('redir');

	const paramMap: Record<string, Record<number, string>> = {};

	for (const [key, value] of urlParams.entries()) {
		if (key === 'redir') {
			continue;
		}

		const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
		if (arrayMatch) {
			const paramName = arrayMatch[1];
			const index = parseInt(arrayMatch[2], 10);

			if (!paramMap[paramName]) {
				paramMap[paramName] = {};
			}
			paramMap[paramName][index] = value;
		}
	}

	if (paramMap.step) {
		const indices = Object.keys(paramMap.step).sort((a, b) => parseInt(a) - parseInt(b));

		const steps = indices.map(index => {
			const stepName = paramMap.step[parseInt(index)];
			const stepVars: Record<string, any> = {};

			for (const [paramName, values] of Object.entries(paramMap)) {
				if (paramName !== 'step' && values[parseInt(index)] !== undefined) {
					let value = values[parseInt(index)];
					if (paramName === 'url' || paramName.includes('url') || paramName.includes('Url')) {
						value = expandUrlQueryValue(value);
					}
					stepVars[paramName] = value;
				}
			}

			return {
				step: stepName,
				vars: stepVars
			};
		});

		return {
			steps: steps,
			redir: redirParam ? parseInt(redirParam, 10) : null
		};
	}

	return null;
}
