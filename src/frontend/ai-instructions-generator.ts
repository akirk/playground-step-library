/**
 * AI Instructions Generator
 * Generates markdown snippets for AI agent instruction files (claude.md, agents.md, etc.)
 */

import { minimalEncode, shortenUrl, isDefaultValue } from './utils';
import { StepDefinition } from './types';
import PlaygroundStepLibrary from '../index';

export type AIInstructionsUrlType = 'step-library' | 'playground-hash' | 'playground-data';

export interface AIInstructionsGeneratorDependencies {
	blueprintSteps: HTMLElement;
	customSteps: Record<string, StepDefinition>;
}

/**
 * Extract GitHub repo info from a URL
 */
function parseGitHubUrl( url: string ): { org: string; repo: string; branch?: string; isGitHub: boolean } | null {
	const expandedUrl = url.includes( '://' ) ? url : 'https://' + url;

	const patterns = [
		/^https?:\/\/github\.com\/(?<org>[^\/]+)\/(?<repo>[^\/]+)\/tree\/(?<branch>[^\/]+)/,
		/^https?:\/\/github\.com\/(?<org>[^\/]+)\/(?<repo>[^\/]+)\/pull\/\d+/,
		/^https?:\/\/github\.com\/(?<org>[^\/]+)\/(?<repo>[^\/]+)/,
		/^github\.com\/(?<org>[^\/]+)\/(?<repo>[^\/]+)\/tree\/(?<branch>[^\/]+)/,
		/^github\.com\/(?<org>[^\/]+)\/(?<repo>[^\/]+)/,
		/^(?<org>[^\/]+)\/(?<repo>[^\/]+)\/tree\/(?<branch>[^\/]+)/,
		/^(?<org>[^\/]+)\/(?<repo>[^\/]+)/
	];

	for ( const pattern of patterns ) {
		const match = expandedUrl.match( pattern );
		if ( match && match.groups ) {
			const isGitHub = url.includes( 'github.com' ) ||
				( !url.includes( '://' ) && !url.includes( 'wordpress.org' ) && match.groups.org && match.groups.repo );
			if ( isGitHub ) {
				return {
					org: match.groups.org,
					repo: match.groups.repo,
					branch: match.groups.branch,
					isGitHub: true
				};
			}
		}
	}

	return null;
}

/**
 * Replace the branch name in a GitHub URL with BRANCH_NAME placeholder
 */
function replaceBranchWithPlaceholder( url: string ): string {
	const parsed = parseGitHubUrl( url );
	if ( !parsed || !parsed.isGitHub ) {
		return url;
	}

	const shortUrl = shortenUrl( url );

	if ( parsed.branch ) {
		return shortUrl.replace( '/tree/' + parsed.branch, '/tree/BRANCH_NAME' );
	}

	if ( shortUrl.includes( '/tree/' ) ) {
		return shortUrl;
	}

	return 'github.com/' + parsed.org + '/' + parsed.repo + '/tree/BRANCH_NAME';
}

/**
 * Generate a redirect URL with BRANCH_NAME placeholders for GitHub URLs
 */
export function generateRedirectUrlWithBranchPlaceholder(
	deps: AIInstructionsGeneratorDependencies
): string | null {
	const steps = deps.blueprintSteps.querySelectorAll( '.step' );

	if ( steps.length === 0 ) {
		return null;
	}

	const params: string[] = [];
	params.push( 'redir=1' );

	let hasGitHubUrl = false;

	steps.forEach( ( stepElement, index ) => {
		const stepName = ( stepElement as HTMLElement ).dataset.step;
		params.push( `step[${index}]=` + stepName );

		const inputs = stepElement.querySelectorAll( 'input, textarea, select' );
		inputs.forEach( input => {
			const varName = ( input as HTMLInputElement ).name;
			if ( varName ) {
				let value: string;
				if ( ( input as HTMLInputElement ).type === 'checkbox' ) {
					if ( ( input as HTMLInputElement ).checked ) {
						value = 'true';
					} else {
						return;
					}
				} else {
					value = ( input as HTMLInputElement ).value;
				}
				if ( !isDefaultValue( stepName || '', varName, value, deps.customSteps ) ) {
					let encodedValue = value;

					if ( varName === 'url' || varName.includes( 'url' ) || varName.includes( 'Url' ) ) {
						const parsed = parseGitHubUrl( value );
						if ( parsed && parsed.isGitHub ) {
							hasGitHubUrl = true;
							encodedValue = replaceBranchWithPlaceholder( value );
						} else {
							encodedValue = shortenUrl( value );
						}
					}

					encodedValue = minimalEncode( encodedValue );
					params.push( `${varName}[${index}]=` + encodedValue );
				}
			}
		} );
	} );

	if ( !hasGitHubUrl ) {
		return null;
	}

	const baseUrl = window.location.origin + window.location.pathname;
	return `${baseUrl}?${params.join( '&' )}`;
}

/**
 * Find the first GitHub URL in the steps
 */
function findFirstGitHubUrl( deps: AIInstructionsGeneratorDependencies ): string | null {
	const steps = Array.from( deps.blueprintSteps.querySelectorAll( '.step' ) );

	for ( let i = 0; i < steps.length; i++ ) {
		const stepElement = steps[i];
		const inputs = Array.from( stepElement.querySelectorAll( 'input, textarea' ) );
		for ( let j = 0; j < inputs.length; j++ ) {
			const input = inputs[j] as HTMLInputElement;
			const varName = input.name;
			if ( varName === 'url' || varName.includes( 'url' ) || varName.includes( 'Url' ) ) {
				const value = input.value;
				const parsed = parseGitHubUrl( value );
				if ( parsed && parsed.isGitHub ) {
					return value;
				}
			}
		}
	}

	return null;
}

/**
 * Helper to collect step data with BRANCH_NAME placeholder
 */
function collectStepsDataWithPlaceholder( deps: AIInstructionsGeneratorDependencies ): { stepsData: any[]; hasGitHubUrl: boolean } {
	const steps = deps.blueprintSteps.querySelectorAll( '.step' );
	let hasGitHubUrl = false;
	const stepsData: any[] = [];

	steps.forEach( ( stepElement ) => {
		const stepName = ( stepElement as HTMLElement ).dataset.step;
		const stepData: any = { step: stepName };

		const inputs = stepElement.querySelectorAll( 'input, textarea, select' );
		inputs.forEach( input => {
			const varName = ( input as HTMLInputElement ).name;
			if ( varName ) {
				let value: string;
				if ( ( input as HTMLInputElement ).type === 'checkbox' ) {
					if ( ( input as HTMLInputElement ).checked ) {
						value = 'true';
					} else {
						return;
					}
				} else {
					value = ( input as HTMLInputElement ).value;
				}

				if ( varName === 'url' || varName.includes( 'url' ) || varName.includes( 'Url' ) ) {
					const parsed = parseGitHubUrl( value );
					if ( parsed && parsed.isGitHub ) {
						hasGitHubUrl = true;
						value = replaceBranchWithPlaceholder( value );
						if ( !value.startsWith( 'https://' ) ) {
							value = 'https://' + value;
						}
					}
				}

				stepData[varName] = value;
			}
		} );

		stepsData.push( stepData );
	} );

	return { stepsData, hasGitHubUrl };
}

/**
 * Generate a playground URL with BRANCH_NAME placeholder (hash format)
 */
function generatePlaygroundHashUrl( deps: AIInstructionsGeneratorDependencies ): string | null {
	const { stepsData, hasGitHubUrl } = collectStepsDataWithPlaceholder( deps );

	if ( stepsData.length === 0 || !hasGitHubUrl ) {
		return null;
	}

	const compiler = new PlaygroundStepLibrary();
	const blueprint = compiler.compile( { steps: stepsData } );
	const blueprintJson = JSON.stringify( blueprint );

	return `https://playground.wordpress.net/#${blueprintJson}`;
}

/**
 * Generate a playground URL with BRANCH_NAME placeholder (data URL format, no base64)
 */
function generatePlaygroundDataUrl( deps: AIInstructionsGeneratorDependencies ): string | null {
	const { stepsData, hasGitHubUrl } = collectStepsDataWithPlaceholder( deps );

	if ( stepsData.length === 0 || !hasGitHubUrl ) {
		return null;
	}

	const compiler = new PlaygroundStepLibrary();
	const blueprint = compiler.compile( { steps: stepsData } );
	const blueprintJson = JSON.stringify( blueprint );

	return `https://playground.wordpress.net/?blueprint-url=${encodeURIComponent( 'data:application/json,' + blueprintJson )}`;
}

/**
 * Get URL for a specific type
 */
function getUrlForType( deps: AIInstructionsGeneratorDependencies, urlType: AIInstructionsUrlType ): string | null {
	switch ( urlType ) {
		case 'playground-hash':
			return generatePlaygroundHashUrl( deps );
		case 'playground-data':
			return generatePlaygroundDataUrl( deps );
		case 'step-library':
		default:
			return generateRedirectUrlWithBranchPlaceholder( deps );
	}
}

/**
 * Generate the markdown content for AI instructions
 */
export function generateAIInstructions(
	deps: AIInstructionsGeneratorDependencies,
	urlType: AIInstructionsUrlType = 'step-library'
): string | null {
	const url = getUrlForType( deps, urlType );

	if ( !url ) {
		return null;
	}

	const exampleBranch = 'fix/bug-123';
	const exampleUrl = url.replace( /BRANCH_NAME/g, exampleBranch );

	const markdown = `## Playground Link

At the end of your messages, include a link to test the changes in WordPress Playground.

**Important:** Replace \`BRANCH_NAME\` in the URL below with the actual git branch name you're working on.

\`\`\`
[Test in WordPress Playground](${url})
\`\`\`

### Example

If you're working on branch \`${exampleBranch}\`, the link should be:

\`\`\`
[Test in WordPress Playground](${exampleUrl})
\`\`\`
`;

	return markdown;
}

/**
 * Check if the current blueprint has any GitHub URLs
 */
export function hasGitHubUrls( deps: AIInstructionsGeneratorDependencies ): boolean {
	return findFirstGitHubUrl( deps ) !== null;
}

export interface BranchPlaceholderUrls {
	'step-library': string | null;
	'playground-hash': string | null;
	'playground-data': string | null;
}

/**
 * Generate all URL types for easy switching
 */
export function generateBranchPlaceholderUrls( deps: AIInstructionsGeneratorDependencies ): BranchPlaceholderUrls {
	return {
		'step-library': generateRedirectUrlWithBranchPlaceholder( deps ),
		'playground-hash': generatePlaygroundHashUrl( deps ),
		'playground-data': generatePlaygroundDataUrl( deps )
	};
}
