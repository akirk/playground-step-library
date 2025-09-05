import { addClientRole } from '../steps/addClientRole.js';
import { addCorsProxy } from '../steps/addCorsProxy.js';
import { addFilter } from '../steps/addFilter.js';
import { addMedia } from '../steps/addMedia.js';
import { addPage } from '../steps/addPage.js';
import { addPost } from '../steps/addPost.js';
import { addProduct } from '../steps/addProduct.js';
import { blueprintExtractor } from '../steps/blueprintExtractor.js';
import { blueprintRecorder } from '../steps/blueprintRecorder.js';
import { changeAdminColorScheme } from '../steps/changeAdminColorScheme.js';
import { createUser } from '../steps/createUser.js';
import { customPostType } from '../steps/customPostType.js';
import { deleteAllPosts } from '../steps/deleteAllPosts.js';
import { disableWelcomeGuides } from '../steps/disableWelcomeGuides.js';
import { doAction } from '../steps/doAction.js';
import { fakeHttpResponse } from '../steps/fakeHttpResponse.js';
import { githubImportExportWxr } from '../steps/githubImportExportWxr.js';
import { githubPlugin } from '../steps/githubPlugin.js';
import { githubPluginRelease } from '../steps/githubPluginRelease.js';
import { githubTheme } from '../steps/githubTheme.js';
import { importFriendFeeds } from '../steps/importFriendFeeds.js';
import { importWordPressComExport } from '../steps/importWordPressComExport.js';
import { installPhEditor } from '../steps/installPhEditor.js';
import { installPhpLiteAdmin } from '../steps/installPhpLiteAdmin.js';
import { jetpackOfflineMode } from '../steps/jetpackOfflineMode.js';
import { muPlugin } from '../steps/muPlugin.js';
import { removeDashboardWidgets } from '../steps/removeDashboardWidgets.js';
import { renameDefaultCategory } from '../steps/renameDefaultCategory.js';
import { runWpCliCommand } from '../steps/runWpCliCommand.js';
import { sampleContent } from '../steps/sampleContent.js';
import { setLandingPage } from '../steps/setLandingPage.js';
import { setLanguage } from '../steps/setLanguage.js';
import { setSiteName } from '../steps/setSiteName.js';
import { setTT4Homepage } from '../steps/setTT4Homepage.js';
import { showAdminNotice } from '../steps/showAdminNotice.js';
import { skipWooCommerceWizard } from '../steps/skipWooCommerceWizard.js';
import { defineWpConfigConst } from '../steps/builtin/defineWpConfigConst.js';
import { enableMultisite } from '../steps/builtin/enableMultisite.js';
import { importWxr } from '../steps/builtin/importWxr.js';
import { installPlugin } from '../steps/builtin/installPlugin.js';
import { installTheme } from '../steps/builtin/installTheme.js';
import { login } from '../steps/builtin/login.js';
import { runPHP } from '../steps/builtin/runPHP.js';
import { setSiteOption } from '../steps/builtin/setSiteOption.js';
/**
 * WordPress Playground Step Library Compiler
 * Transforms blueprints with custom steps into blueprints with native steps
 */
class PlaygroundStepLibrary {
    constructor(options = {}) {
        this.customSteps = {};
        this.loadCustomSteps();
    }
    /**
     * Load all ES module steps
     */
    loadCustomSteps() {
        // Add imported ES modules to customSteps
        this.customSteps.defineWpConfigConst = defineWpConfigConst;
        this.customSteps.importWxr = importWxr;
        this.customSteps.installPlugin = installPlugin;
        this.customSteps.installTheme = installTheme;
        this.customSteps.login = login;
        this.customSteps.runPHP = runPHP;
        this.customSteps.setSiteOption = setSiteOption;
        this.customSteps.addClientRole = addClientRole;
        this.customSteps.addCorsProxy = addCorsProxy;
        this.customSteps.addFilter = addFilter;
        this.customSteps.addMedia = addMedia;
        this.customSteps.addPage = addPage;
        this.customSteps.addPost = addPost;
        this.customSteps.addProduct = addProduct;
        this.customSteps.blueprintExtractor = blueprintExtractor;
        this.customSteps.blueprintRecorder = blueprintRecorder;
        this.customSteps.changeAdminColorScheme = changeAdminColorScheme;
        this.customSteps.createUser = createUser;
        this.customSteps.customPostType = customPostType;
        this.customSteps.deleteAllPosts = deleteAllPosts;
        this.customSteps.disableWelcomeGuides = disableWelcomeGuides;
        this.customSteps.doAction = doAction;
        this.customSteps.fakeHttpResponse = fakeHttpResponse;
        this.customSteps.githubImportExportWxr = githubImportExportWxr;
        this.customSteps.githubPlugin = githubPlugin;
        this.customSteps.githubPluginRelease = githubPluginRelease;
        this.customSteps.githubTheme = githubTheme;
        this.customSteps.importFriendFeeds = importFriendFeeds;
        this.customSteps.importWordPressComExport = importWordPressComExport;
        this.customSteps.installPhEditor = installPhEditor;
        this.customSteps.installPhpLiteAdmin = installPhpLiteAdmin;
        this.customSteps.jetpackOfflineMode = jetpackOfflineMode;
        this.customSteps.muPlugin = muPlugin;
        this.customSteps.removeDashboardWidgets = removeDashboardWidgets;
        this.customSteps.renameDefaultCategory = renameDefaultCategory;
        this.customSteps.runWpCliCommand = runWpCliCommand;
        this.customSteps.sampleContent = sampleContent;
        this.customSteps.setLandingPage = setLandingPage;
        this.customSteps.setLanguage = setLanguage;
        this.customSteps.setSiteName = setSiteName;
        this.customSteps.setTT4Homepage = setTT4Homepage;
        this.customSteps.showAdminNotice = showAdminNotice;
        this.customSteps.skipWooCommerceWizard = skipWooCommerceWizard;
        this.customSteps.enableMultisite = enableMultisite;
    }
    /**
     * Compile a blueprint by transforming custom steps into native steps
     * Uses the transformJson logic from script.js adapted for TypeScript
     */
    compile(blueprint, options = {}) {
        let inputData;
        if (typeof blueprint === 'string') {
            inputData = JSON.parse(blueprint);
        }
        else {
            inputData = { ...blueprint };
        }
        if (!inputData || !inputData.steps || !Array.isArray(inputData.steps)) {
            throw new Error('Invalid blueprint: missing steps array');
        }
        // Default user-defined options
        const userDefined = {
            landingPage: '/',
            features: {},
            ...options
        };
        // Merge user defined options with input data
        inputData = Object.assign(userDefined, inputData);
        const outputData = Object.assign({}, inputData);
        if (outputData.title) {
            delete outputData.title;
        }
        outputData.steps = [];
        inputData.steps.forEach((step, index) => {
            let outSteps = [];
            if (!step.vars) {
                step.vars = {};
            }
            // Move all step properties (except 'step' and 'vars') into vars
            for (const key in step) {
                if (key !== 'step' && key !== 'vars') {
                    step.vars[key] = step[key];
                }
            }
            step.vars.stepIndex = index;
            if (this.customSteps[step.step]) {
                outSteps = this.customSteps[step.step](step, inputData);
                if (typeof outSteps !== 'object') {
                    outSteps = [];
                }
                if (outSteps.landingPage) {
                    outputData.landingPage = outSteps.landingPage;
                }
                if (outSteps.features) {
                    outputData.features = outSteps.features;
                }
                if (outSteps.login) {
                    outputData.login = outSteps.login;
                }
                if (step.count) {
                    outSteps = outSteps.slice(0, step.count);
                }
            }
            else {
                outSteps.push(step);
            }
            for (let i = 0; i < outSteps.length; i++) {
                if (typeof outSteps[i] !== 'object') {
                    continue;
                }
                // Handle query params (removed from node environment)
                if (typeof outSteps[i].queryParams === 'object') {
                    delete outSteps[i].queryParams;
                }
                // Variable substitution
                if (step.vars) {
                    Object.keys(step.vars).forEach(key => {
                        for (let j in outSteps[i]) {
                            if (typeof outSteps[i][j] === 'object') {
                                Object.keys(outSteps[i][j]).forEach(k => {
                                    if (typeof outSteps[i][j][k] === 'string' && outSteps[i][j][k].includes('${' + key + '}')) {
                                        outSteps[i][j][k] = outSteps[i][j][k].replace('${' + key + '}', step.vars[key]);
                                    }
                                });
                            }
                            else if (typeof outSteps[i][j] === 'string' && outSteps[i][j].includes('${' + key + '}')) {
                                outSteps[i][j] = outSteps[i][j].replace('${' + key + '}', step.vars[key]);
                            }
                        }
                    });
                }
                // Remove unnecessary whitespace
                for (let j in outSteps[i]) {
                    if (typeof outSteps[i][j] === 'string') {
                        outSteps[i][j] = outSteps[i][j].replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\n\s+/g, '\n');
                    }
                    else if (typeof outSteps[i][j] === 'object') {
                        Object.keys(outSteps[i][j]).forEach(k => {
                            if (typeof outSteps[i][j][k] === 'string') {
                                outSteps[i][j][k] = outSteps[i][j][k].replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\n\s+/g, '\n');
                            }
                        });
                    }
                }
            }
            if (outSteps) {
                for (let i = 0; i < outSteps.length; i++) {
                    // Deduplication logic
                    if (outSteps[i].dedup === undefined || outSteps[i].dedup || outSteps[i].dedup === 'last') {
                        let dedupIndex = -1;
                        const dedupStep = outputData.steps.find((step, index) => {
                            for (let j in step) {
                                if (outSteps[i][j] === undefined) {
                                    return false;
                                }
                                if (typeof step[j] === 'object') {
                                    if (JSON.stringify(step[j]) !== JSON.stringify(outSteps[i][j])) {
                                        return false;
                                    }
                                }
                                else if (step[j] !== outSteps[i][j]) {
                                    return false;
                                }
                            }
                            dedupIndex = index;
                            return true;
                        });
                        if (outSteps[i].dedup === 'last' && dedupIndex !== -1) {
                            outputData.steps.splice(dedupIndex, 1);
                        }
                        else if (dedupStep) {
                            continue;
                        }
                        if (outSteps[i].dedup) {
                            delete outSteps[i].dedup;
                        }
                    }
                    outputData.steps.push(outSteps[i]);
                }
            }
        });
        // Clean up output data
        if (outputData.landingPage === '/') {
            delete outputData.landingPage;
        }
        if (outputData.features && Object.keys(outputData.features).length === 0) {
            delete outputData.features;
        }
        if (outputData.steps.length === 0) {
            delete outputData.steps;
        }
        return outputData;
    }
    /**
     * Get information about available custom steps
     */
    getAvailableSteps() {
        const stepInfo = {};
        for (const [stepName, stepDef] of Object.entries(this.customSteps)) {
            stepInfo[stepName] = {
                description: stepDef.description || '',
                vars: stepDef.vars || [],
                builtin: stepDef.builtin || false,
                multiple: stepDef.multiple || false
            };
        }
        return stepInfo;
    }
    /**
     * Validate a blueprint structure
     */
    validateBlueprint(blueprint) {
        let parsedBlueprint;
        if (typeof blueprint === 'string') {
            try {
                parsedBlueprint = JSON.parse(blueprint);
            }
            catch (error) {
                return { valid: false, error: 'Invalid JSON format' };
            }
        }
        else {
            parsedBlueprint = blueprint;
        }
        if (!parsedBlueprint || typeof parsedBlueprint !== 'object') {
            return { valid: false, error: 'Blueprint must be an object' };
        }
        if (!parsedBlueprint.steps || !Array.isArray(parsedBlueprint.steps)) {
            return { valid: false, error: 'Blueprint must contain a steps array' };
        }
        // Validate each step
        for (let i = 0; i < parsedBlueprint.steps.length; i++) {
            const step = parsedBlueprint.steps[i];
            if (!step.step || typeof step.step !== 'string') {
                return { valid: false, error: `Step ${i} must have a 'step' property with step name` };
            }
            // Check if step exists (custom or assumed native)
            const stepName = step.step;
            if (this.customSteps[stepName]) {
                const customStep = this.customSteps[stepName];
                if (customStep.vars) {
                    // Validate required variables
                    for (const varDef of customStep.vars) {
                        if (varDef.required && !step.hasOwnProperty(varDef.name)) {
                            return {
                                valid: false,
                                error: `Step ${i} (${stepName}) is missing required variable: ${varDef.name}`
                            };
                        }
                    }
                }
            }
        }
        return { valid: true };
    }
}
export default PlaygroundStepLibrary;
//# sourceMappingURL=index.js.map