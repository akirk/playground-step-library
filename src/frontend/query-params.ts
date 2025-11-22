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
						value = expandUrl(value);
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
