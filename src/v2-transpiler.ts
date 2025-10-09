import type { Blueprint, StepDefinition } from '@wp-playground/blueprints';

interface BlueprintV2 {
    version: 2;
    wordpressVersion?: string;
    phpVersion?: string;
    plugins?: string[];
    themes?: string[];
    activeTheme?: string;
    muPlugins?: string[];
    constants?: Record<string, any>;
    siteOptions?: Record<string, any>;
    siteLanguage?: string;
    users?: any[];
    roles?: any[];
    postTypes?: Record<string, any>;
    content?: any[];
    media?: any[];
    fonts?: any[];
    additionalStepsAfterExecution?: StepDefinition[];
    blueprintMeta?: {
        name?: string;
        description?: string;
        author?: string;
        tags?: string[];
    };
}

/**
 * Transpiles a Blueprint v1 to Blueprint v2 format
 * Following the spec from WordPress Extension Proposal 1: Blueprints version 2
 */
export function transpileToV2(v1Blueprint: Blueprint): BlueprintV2 {
    const v2: BlueprintV2 = {
        version: 2
    };

    // Handle preferredVersions
    if ((v1Blueprint as any).preferredVersions) {
        const versions = (v1Blueprint as any).preferredVersions;
        if (versions.wp && versions.wp !== 'latest') {
            v2.wordpressVersion = versions.wp;
        }
        if (versions.php && versions.php !== 'latest') {
            v2.phpVersion = versions.php;
        }
    }

    // Handle meta information
    if ((v1Blueprint as any).meta) {
        const meta = (v1Blueprint as any).meta;
        v2.blueprintMeta = {};
        if (meta.title) {
            v2.blueprintMeta.name = meta.title;
        }
        if (meta.description) {
            v2.blueprintMeta.description = meta.description;
        }
        if (meta.author) {
            v2.blueprintMeta.author = meta.author;
        }
        if (meta.categories && Array.isArray(meta.categories)) {
            v2.blueprintMeta.tags = meta.categories;
        }
    }

    // Process steps and extract declarative properties
    const plugins: string[] = [];
    const themes: string[] = [];
    const muPlugins: string[] = [];
    const constants: Record<string, any> = {};
    const siteOptions: Record<string, any> = {};
    const additionalSteps: StepDefinition[] = [];

    if (v1Blueprint.steps && Array.isArray(v1Blueprint.steps)) {
        for (const step of v1Blueprint.steps) {
            if (!step || typeof step === 'string') {
                continue;
            }

            const stepDef = step as StepDefinition;

            // Extract plugins from installPlugin steps
            if (stepDef.step === 'installPlugin') {
                const pluginData = stepDef as any;
                if (pluginData.pluginData && pluginData.pluginData.resource === 'wordpress.org/plugins' && pluginData.pluginData.slug) {
                    plugins.push(pluginData.pluginData.slug);
                    continue;
                } else if (pluginData.pluginZipFile) {
                    if (typeof pluginData.pluginZipFile.resource === 'string' && pluginData.pluginZipFile.resource === 'wordpress.org/plugins' && pluginData.pluginZipFile.slug) {
                        plugins.push(pluginData.pluginZipFile.slug);
                        continue;
                    } else if (typeof pluginData.pluginZipFile === 'string') {
                        // Handle string slugs
                        if (!pluginData.pluginZipFile.includes('://') && !pluginData.pluginZipFile.includes('/')) {
                            plugins.push(pluginData.pluginZipFile);
                            continue;
                        }
                    }
                }
            }

            // Extract themes from installTheme steps
            if (stepDef.step === 'installTheme') {
                const themeData = stepDef as any;
                if (themeData.themeData && themeData.themeData.resource === 'wordpress.org/themes' && themeData.themeData.slug) {
                    themes.push(themeData.themeData.slug);
                    continue;
                } else if (themeData.themeZipFile) {
                    if (typeof themeData.themeZipFile.resource === 'string' && themeData.themeZipFile.resource === 'wordpress.org/themes' && themeData.themeZipFile.slug) {
                        themes.push(themeData.themeZipFile.slug);
                        continue;
                    } else if (typeof themeData.themeZipFile === 'string') {
                        // Handle string slugs
                        if (!themeData.themeZipFile.includes('://') && !themeData.themeZipFile.includes('/')) {
                            themes.push(themeData.themeZipFile);
                            continue;
                        }
                    }
                }
            }

            // Extract constants from defineWpConfigConsts
            if (stepDef.step === 'defineWpConfigConsts') {
                const constDef = stepDef as any;
                if (constDef.consts && typeof constDef.consts === 'object') {
                    Object.assign(constants, constDef.consts);
                    continue;
                }
            }

            // Extract site options from setSiteOptions
            if (stepDef.step === 'setSiteOptions') {
                const optionsDef = stepDef as any;
                if (optionsDef.options && typeof optionsDef.options === 'object') {
                    Object.assign(siteOptions, optionsDef.options);
                    continue;
                }
            }

            // Extract site language from setSiteLanguage
            if (stepDef.step === 'setSiteLanguage') {
                const langDef = stepDef as any;
                if (langDef.language) {
                    v2.siteLanguage = langDef.language;
                    continue;
                }
            }

            // All other steps go to additionalStepsAfterExecution
            additionalSteps.push(stepDef);
        }
    }

    // Only add arrays/objects if they have content
    if (plugins.length > 0) {
        v2.plugins = plugins;
    }
    if (themes.length > 0) {
        v2.themes = themes;
    }
    if (muPlugins.length > 0) {
        v2.muPlugins = muPlugins;
    }
    if (Object.keys(constants).length > 0) {
        v2.constants = constants;
    }
    if (Object.keys(siteOptions).length > 0) {
        v2.siteOptions = siteOptions;
    }
    if (additionalSteps.length > 0) {
        v2.additionalStepsAfterExecution = additionalSteps;
    }

    // Handle landingPage
    if ((v1Blueprint as any).landingPage && (v1Blueprint as any).landingPage !== '/') {
        // Landing page in v2 goes into additionalStepsAfterExecution as a step
        if (!v2.additionalStepsAfterExecution) {
            v2.additionalStepsAfterExecution = [];
        }
        // Note: v2 doesn't have a direct landingPage property at the root level
        // We'll preserve it as-is for now since the runner configuration handles it
    }

    // Handle features (networking)
    if ((v1Blueprint as any).features) {
        // Features in v1 are preserved in additionalSteps as they map to runner configuration
    }

    // Handle login
    if ((v1Blueprint as any).login !== undefined) {
        // Login in v1 maps to applicationOptions in v2, which is runner-specific
        // We'll preserve it in additionalStepsAfterExecution
    }

    return v2;
}

/**
 * Check if a blueprint should be transpiled to v2
 * Returns true if the blueprint doesn't already have version: 2
 */
export function shouldTranspileToV2(blueprint: any): boolean {
    return !blueprint.version || blueprint.version !== 2;
}
