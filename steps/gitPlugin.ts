import type { StepFunction, GitPluginStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import { parseGitUrl, parseReleaseUrl } from './gitProviders.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export const gitPlugin: StepFunction<GitPluginStep> = ( step: GitPluginStep ): StepResult => {
	return {
		toV1() {
			const url = step.vars?.url || '';

			const releaseInfo = parseReleaseUrl( url );
			if ( releaseInfo ) {
				const { domain, org, repo, version, filename } = releaseInfo;
				const downloadUrl = `https://${domain}/${org}/${repo}/releases/download/${version}/${filename}`;

				return {
					steps: [ {
						step: 'installPlugin',
						pluginData: {
							resource: 'url',
							url: downloadUrl,
						},
						options: {
							activate: true,
						},
						progress: {
							caption: `Installing ${filename} from ${org}/${repo} (${version})`,
						},
					} ],
				};
			}

			const parsed = parseGitUrl( url );
			if ( ! parsed ) {
				return { steps: [] };
			}

			const { provider, org, repo, branch, directory, prNumber, repoUrl } = parsed;

			let ref = 'HEAD';
			let refType: string | undefined;
			let caption = `Installing plugin from ${provider.name}: ${org}/${repo}`;

			if ( prNumber ) {
				ref = provider.prRefFormat( prNumber );
				refType = 'refname';
				caption = `Installing plugin from ${org}/${repo} PR #${prNumber}`;
			} else if ( branch ) {
				if ( ! /^[a-zA-Z0-9_.\/-]+$/.test( branch ) ) {
					return { steps: [] };
				}
				ref = branch;
				refType = 'branch';
			}

			let gitUrl = repoUrl;
			if ( provider.requiresGitSuffix && ! gitUrl.endsWith( '.git' ) ) {
				gitUrl += '.git';
			}

			const pluginData: Record<string, any> = {
				resource: 'git:directory',
				url: gitUrl,
				ref: ref,
			};

			if ( refType ) {
				pluginData.refType = refType;
			}

			if ( directory ) {
				pluginData.path = directory;
			}

			const result: BlueprintV1Declaration = {
				steps: [ {
					step: 'installPlugin',
					pluginData: pluginData as any,
					options: {
						activate: true,
					},
					progress: {
						caption: caption,
					},
				} ],
			};

			if ( step.vars?.prs && provider.supportsPlaygroundExport ) {
				( result.steps![0] as any ).queryParams = {
					'gh-ensure-auth': 'yes',
					'ghexport-repo-url': repoUrl,
					'ghexport-content-type': 'plugin',
					'ghexport-plugin': repo,
					'ghexport-playground-root': `/wordpress/wp-content/plugins/${repo}`,
					'ghexport-pr-action': 'create',
					'ghexport-allow-include-zip': 'no',
				};
			}

			return result;
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		},
	};
};

gitPlugin.description = 'Install a plugin from a Git repository (GitHub, GitLab, Codeberg, etc.).';
gitPlugin.vars = [
	{
		name: 'url',
		description: 'Git URL of the plugin (supports GitHub, GitLab, Codeberg, and other git hosts).',
		required: true,
		samples: [
			'https://github.com/akirk/blueprint-recorder',
			'https://github.com/Automattic/wordpress-activitypub/tree/trunk',
			'https://gitlab.com/webwirtschaft/structured-content',
			'https://github.com/akirk/friends/pull/559',
		],
	},
	{
		name: 'prs',
		description: 'Add support for submitting Pull Requests (GitHub only).',
		type: 'boolean',
		samples: [ 'false', 'true' ],
	},
];
