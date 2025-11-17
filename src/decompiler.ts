import type { StepLibraryBlueprint, StepLibraryStepDefinition } from '../steps/types';

interface NativeBlueprint {
	steps?: Array<any>;
	landingPage?: string;
	features?: Record<string, any>;
	login?: any;
	[key: string]: any;
}

interface DecompilerResult {
	steps: Array<StepLibraryStepDefinition>;
	unmappedSteps: Array<any>;
	confidence: 'high' | 'medium' | 'low';
	warnings: Array<string>;
}

export class BlueprintDecompiler {
	private warnings: Array<string> = [];
	private unmappedSteps: Array<any> = [];

	decompile(nativeBlueprint: NativeBlueprint): DecompilerResult {
		this.warnings = [];
		this.unmappedSteps = [];

		const steps: Array<StepLibraryStepDefinition> = [];

		if (nativeBlueprint.plugins && Array.isArray(nativeBlueprint.plugins)) {
			for (const plugin of nativeBlueprint.plugins) {
				if (typeof plugin === 'string') {
					steps.push({
						step: 'installPlugin',
						url: `https://wordpress.org/plugins/${plugin}/`,
						prs: false
					});
				} else if (plugin && typeof plugin === 'object') {
					const pluginStep = this.decompileInstallPlugin({
						step: 'installPlugin',
						pluginData: plugin,
						options: { activate: true }
					});
					if (pluginStep) {
						steps.push(pluginStep);
					}
				}
			}
		}

		if (nativeBlueprint.login) {
			if (nativeBlueprint.login === true) {
				steps.push({
					step: 'login',
					username: 'admin',
					password: 'password',
					landingPage: false
				});
			} else if (typeof nativeBlueprint.login === 'object') {
				steps.push({
					step: 'login',
					username: nativeBlueprint.login.username || 'admin',
					password: nativeBlueprint.login.password || 'password',
					landingPage: false
				});
			}
		}

		const nativeSteps = nativeBlueprint.steps || [];

		for (let i = 0; i < nativeSteps.length; i++) {
			const nativeStep = nativeSteps[i];
			const decompiled = this.decompileStep(nativeStep, nativeSteps, i);

			if (decompiled) {
				if (Array.isArray(decompiled)) {
					steps.push(...decompiled);
				} else {
					steps.push(decompiled);
				}
			} else {
				this.unmappedSteps.push(nativeStep);
			}
		}

		if (nativeBlueprint.siteOptions && typeof nativeBlueprint.siteOptions === 'object') {
			for (const [name, value] of Object.entries(nativeBlueprint.siteOptions)) {
				if (name === 'blogname' || name === 'blogdescription') {
					const existing = steps.find(s => s.step === 'setSiteName');
					if (!existing) {
						const blogname = nativeBlueprint.siteOptions.blogname || '';
						const blogdescription = nativeBlueprint.siteOptions.blogdescription || '';
						if (blogname || blogdescription) {
							steps.push({
								step: 'setSiteName',
								sitename: blogname,
								tagline: blogdescription
							});
						}
					}
					continue;
				}

				steps.push({
					step: 'setSiteOption',
					name: name,
					value: value as string
				});
			}
		}

		if (nativeBlueprint.constants && typeof nativeBlueprint.constants === 'object') {
			const consts = nativeBlueprint.constants;
			const wpDebug = consts.WP_DEBUG === true;
			const wpDebugDisplay = consts.WP_DEBUG_DISPLAY === true;
			const scriptDebug = consts.SCRIPT_DEBUG === true;

			if (wpDebug || wpDebugDisplay || scriptDebug) {
				steps.push({
					step: 'debug',
					wpDebug,
					wpDebugDisplay,
					scriptDebug,
					queryMonitor: false
				});
			}
		}

		if (nativeBlueprint.landingPage) {
			steps.push({
				step: 'setLandingPage',
				landingPage: nativeBlueprint.landingPage
			});
		}

		const confidence = this.calculateConfidence(steps.length, this.unmappedSteps.length);

		return {
			steps,
			unmappedSteps: this.unmappedSteps,
			confidence,
			warnings: this.warnings
		};
	}

	private decompileStep(nativeStep: any, allSteps: any[], index: number): StepLibraryStepDefinition | StepLibraryStepDefinition[] | null {
		if (!nativeStep || !nativeStep.step) {
			return null;
		}

		switch (nativeStep.step) {
			case 'installPlugin':
				return this.decompileInstallPlugin(nativeStep);

			case 'installTheme':
				return this.decompileInstallTheme(nativeStep);

			case 'runPHP':
				return this.decompileRunPHP(nativeStep);

			case 'writeFile':
				return this.decompileWriteFile(nativeStep);

			case 'defineWpConfigConsts':
				return this.decompileDefineWpConfigConsts(nativeStep, allSteps, index);

			case 'setSiteOptions':
				return this.decompileSetSiteOptions(nativeStep);

			case 'login':
				return this.decompileLogin(nativeStep);

			case 'wp-cli':
				return this.decompileWpCli(nativeStep);

			case 'mkdir':
				return null;

			default:
				this.warnings.push(`Unknown native step type: ${nativeStep.step}`);
				return null;
		}
	}

	private decompileInstallPlugin(nativeStep: any): StepLibraryStepDefinition | null {
		const pluginData = nativeStep.pluginData || {};
		const resource = pluginData.resource;

		if (resource === 'wordpress.org/plugins' && pluginData.slug) {
			return {
				step: 'installPlugin',
				url: `https://wordpress.org/plugins/${pluginData.slug}/`,
				prs: false
			};
		}

		if (resource === 'git:directory' && pluginData.url) {
			const urlMatch = pluginData.url.match(/github\.com\/([^/]+)\/([^/]+)/);
			const refMatch = pluginData.ref?.match(/refs\/pull\/(\d+)\//);

			if (urlMatch && refMatch) {
				const [, owner, repo] = urlMatch;
				const prNumber = refMatch[1];
				return {
					step: 'installPlugin',
					url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
					auth: true,
					prs: false,
					permalink: false
				};
			}

			this.warnings.push(`Could not parse git:directory plugin: ${pluginData.url}`);
			return null;
		}

		if (resource === 'url' && pluginData.url) {
			const downloadsMatch = pluginData.url.match(/^https?:\/\/downloads\.wordpress\.org\/plugin\/([^.]+)\..*\.zip$/);
			if (downloadsMatch) {
				const slug = downloadsMatch[1];
				return {
					step: 'installPlugin',
					url: `https://wordpress.org/plugins/${slug}/`,
					prs: false
				};
			}

			return {
				step: 'installPlugin',
				url: pluginData.url,
				prs: false,
				permalink: false
			};
		}

		this.warnings.push(`Unknown plugin resource type: ${resource}`);
		return null;
	}

	private decompileInstallTheme(nativeStep: any): StepLibraryStepDefinition | null {
		const themeData = nativeStep.themeData || {};
		const resource = themeData.resource;

		if (resource === 'wordpress.org/themes' && themeData.slug) {
			return {
				step: 'installTheme',
				url: `https://wordpress.org/themes/${themeData.slug}/`,
				prs: false
			};
		}

		if (resource === 'url' && themeData.url) {
			const downloadsMatch = themeData.url.match(/^https?:\/\/downloads\.wordpress\.org\/theme\/([^.]+)\..*\.zip$/);
			if (downloadsMatch) {
				const slug = downloadsMatch[1];
				return {
					step: 'installTheme',
					url: `https://wordpress.org/themes/${slug}/`,
					prs: false
				};
			}

			return {
				step: 'installTheme',
				url: themeData.url,
				prs: false,
				permalink: false
			};
		}

		this.warnings.push(`Unknown theme resource type: ${resource}`);
		return null;
	}

	private decompileRunPHP(nativeStep: any): StepLibraryStepDefinition | null {
		const code = nativeStep.code || '';
		const caption = nativeStep.progress?.caption || '';

		if (caption.startsWith('blockExamples:')) {
			return this.decompileBlockExamples(code, caption);
		}

		if (caption.startsWith('Importing feeds to Friends')) {
			return this.decompileImportFriendFeeds(code);
		}

		if (code.includes('wp_insert_post') && code.includes('post_title')) {
			return this.decompileAddPageOrPost(code);
		}

		return {
			step: 'runPHP',
			code: code
		};
	}

	private decompileBlockExamples(code: string, caption: string): StepLibraryStepDefinition | null {
		const blockNamespaceMatch = code.match(/\$block_namespace\s*=\s*['"]([^'"]*)['"]/);
		const limitMatch = code.match(/\$limit\s*=\s*(\d+)/);
		const postIdMatch = code.match(/\$post_id\s*=\s*(\d+)/);
		const excludeCoreMatch = code.match(/\$exclude_core\s*=\s*(true|false)/);
		const postTitleMatch = code.match(/['"]post_title['"]\s*=>\s*['"]([^'"]+)['"]/);

		const step: StepLibraryStepDefinition = {
			step: 'blockExamples',
			blockNamespace: blockNamespaceMatch ? blockNamespaceMatch[1] : '',
			postTitle: postTitleMatch ? postTitleMatch[1] : 'Block Examples',
			limit: limitMatch ? limitMatch[1] : '',
			postId: postIdMatch ? postIdMatch[1] : '1000',
			excludeCore: excludeCoreMatch ? excludeCoreMatch[1] === 'true' : false,
			landingPage: caption.includes('landingPage') || code.includes('landingPage')
		};

		return step;
	}

	private decompileImportFriendFeeds(code: string): StepLibraryStepDefinition | null {
		const feedsMatch = code.match(/\$feeds\s*=\s*array\((.*?)\);/s);

		if (!feedsMatch) {
			this.warnings.push('Could not parse Friends feeds from runPHP');
			return null;
		}

		const feedsArrayContent = feedsMatch[1];
		const feedMatches = feedsArrayContent.matchAll(/array\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/g);
		const feeds: string[] = [];

		for (const match of feedMatches) {
			feeds.push(`${match[1]} ${match[2]}`);
		}

		return {
			step: 'importFriendFeeds',
			opml: feeds.join('\n')
		};
	}

	private decompileAddPageOrPost(code: string): StepLibraryStepDefinition | null {
		const titleMatch = code.match(/['"]post_title['"]\s*=>\s*['"]([^'"]+)['"]/);
		const contentMatch = code.match(/['"]post_content['"]\s*=>\s*['"]([^'"]+)['"]/);
		const typeMatch = code.match(/['"]post_type['"]\s*=>\s*['"]([^'"]+)['"]/);

		const isPost = typeMatch && typeMatch[1] === 'post';
		const step = isPost ? 'addPost' : 'addPage';

		return {
			step,
			title: titleMatch ? titleMatch[1] : '',
			content: contentMatch ? contentMatch[1] : ''
		};
	}

	private decompileWriteFile(nativeStep: any): StepLibraryStepDefinition | null {
		const path = nativeStep.path || '';
		const data = nativeStep.data || '';

		if (path.startsWith('/wordpress/wp-content/mu-plugins/')) {
			const addFilterStep = this.decompileAddFilterFromCode(data);
			if (addFilterStep) {
				return addFilterStep;
			}

			const filename = path.split('/').pop();
			const nameMatch = filename?.match(/^(.+?)(?:-\d+)?\.php$/);
			const name = nameMatch ? nameMatch[1] : filename?.replace('.php', '') || 'my-plugin';

			return {
				step: 'muPlugin',
				name,
				code: data
			};
		}

		this.warnings.push(`Could not decompile writeFile: ${path}`);
		return null;
	}

	private decompileAddFilterFromCode(code: string): StepLibraryStepDefinition | null {
		const cleanCode = code.replace(/<\?php\s*/i, '').trim();

		const singleAddFilterPattern = /^add_filter\s*\(\s*['"]([^'"]+)['"]\s*,\s*(.+?)\s*\)\s*;?\s*$/s;
		const match = cleanCode.match(singleAddFilterPattern);

		if (!match) {
			return null;
		}

		const filterName = match[1];
		let callback = match[2].trim();

		if (callback.startsWith("'") && callback.endsWith("'")) {
			callback = callback.slice(1, -1);
		} else if (callback.startsWith('"') && callback.endsWith('"')) {
			callback = callback.slice(1, -1);
		}

		return {
			step: 'addFilter',
			filter: filterName,
			code: callback
		};
	}

	private decompileDefineWpConfigConsts(nativeStep: any, allSteps: any[], index: number): StepLibraryStepDefinition | null {
		const consts = nativeStep.consts || {};
		const wpDebug = consts.WP_DEBUG === true;
		const wpDebugDisplay = consts.WP_DEBUG_DISPLAY === true;
		const scriptDebug = consts.SCRIPT_DEBUG === true;

		let queryMonitor = false;
		for (let i = index + 1; i < allSteps.length; i++) {
			const nextStep = allSteps[i];
			if (nextStep.step === 'installPlugin' &&
				nextStep.pluginData?.slug === 'query-monitor') {
				queryMonitor = true;
				break;
			}
		}

		return {
			step: 'debug',
			wpDebug,
			wpDebugDisplay,
			scriptDebug,
			queryMonitor
		};
	}

	private decompileSetSiteOptions(nativeStep: any): StepLibraryStepDefinition | null {
		const options = nativeStep.options || {};

		if (options.blogname !== undefined && options.blogdescription !== undefined) {
			return {
				step: 'setSiteName',
				sitename: options.blogname,
				tagline: options.blogdescription
			};
		}

		if (options.blogname !== undefined) {
			return {
				step: 'setSiteName',
				sitename: options.blogname,
				tagline: ''
			};
		}

		if (options.permalink_structure) {
			this.warnings.push('setSiteOptions with permalink_structure may be part of setLandingPage');
		}

		return null;
	}

	private decompileWpCli(nativeStep: any): StepLibraryStepDefinition | null {
		const command = nativeStep.command;

		if (!command) {
			this.warnings.push('wp-cli step missing command');
			return null;
		}

		return {
			step: 'runWpCliCommand',
			command: command
		};
	}

	private decompileLogin(nativeStep: any): StepLibraryStepDefinition | null {
		const username = nativeStep.username || 'admin';
		const password = nativeStep.password || 'password';

		return {
			step: 'login',
			username,
			password,
			landingPage: false
		};
	}

	private calculateConfidence(mappedCount: number, unmappedCount: number): 'high' | 'medium' | 'low' {
		if (unmappedCount === 0 && mappedCount > 0) {
			return 'high';
		}

		const mappedRatio = mappedCount / (mappedCount + unmappedCount);

		if (mappedRatio >= 0.8) {
			return 'high';
		}

		if (mappedRatio >= 0.5) {
			return 'medium';
		}

		return 'low';
	}
}
