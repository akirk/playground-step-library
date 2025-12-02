import type { StepFunction, GitThemeStep, StepResult, CompilationContext } from './types.js';
import { v1ToV2Fallback } from './types.js';
import { parseGitUrl } from './gitProviders.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export const gitTheme: StepFunction<GitThemeStep> = ( step: GitThemeStep, context?: CompilationContext ): StepResult => {
	return {
		toV1() {
			const url = step.vars?.url || '';

			const parsed = parseGitUrl( url );
			if ( ! parsed ) {
				return { steps: [] };
			}

			const { provider, org, repo, branch, directory, repoUrl } = parsed;

			if ( branch && ! /^[a-zA-Z0-9_.\/-]+$/.test( branch ) ) {
				return { steps: [] };
			}

			let gitUrl = repoUrl;
			if ( provider.requiresGitSuffix && ! gitUrl.endsWith( '.git' ) ) {
				gitUrl += '.git';
			}

			const themeData: Record<string, any> = {
				resource: 'git:directory',
				url: gitUrl,
				ref: branch || 'HEAD',
			};

			if ( branch ) {
				themeData.refType = 'branch';
			}

			if ( directory ) {
				themeData.path = directory;
			}

			const caption = `Installing theme from ${provider.name}: ${org}/${repo}${branch ? ' (' + branch + ')' : ''}`;

			const result: BlueprintV1Declaration = {
				steps: [ {
					step: 'installTheme',
					themeData: themeData as any,
					options: {
						activate: true,
					},
					progress: {
						caption: caption,
					},
				} ],
			};

			if ( step.vars?.prs && provider.supportsPlaygroundExport ) {
				context?.setQueryParams( {
					'gh-ensure-auth': 'yes',
					'ghexport-repo-url': repoUrl,
					'ghexport-content-type': 'theme',
					'ghexport-theme': repo,
					'ghexport-playground-root': `/wordpress/wp-content/themes/${repo}`,
					'ghexport-pr-action': 'create',
					'ghexport-allow-include-zip': 'no',
				} );
			}

			return result;
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		},
	};
};

gitTheme.description = 'Install a theme from a Git repository (GitHub, GitLab, Bitbucket, Codeberg, etc.).';
gitTheme.vars = [
	{
		name: 'url',
		description: 'Git URL of the theme (supports GitHub, GitLab, Bitbucket, Codeberg, and other git hosts).',
		required: true,
		samples: [
			'https://github.com/richtabor/kanso',
			'https://codeberg.org/cyclotouriste/jednotka',
			'https://github.com/Automattic/themes/tree/trunk/aether',
		],
	},
	{
		name: 'prs',
		description: 'Add support for submitting Pull Requests (GitHub only).',
		type: 'boolean',
		samples: [ 'false', 'true' ],
	},
];
