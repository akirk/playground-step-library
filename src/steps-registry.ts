// Import converted TypeScript steps
import { addPage } from '../steps/addPage.js';
import { deleteAllPosts } from '../steps/deleteAllPosts.js';
import { installPhEditor } from '../steps/installPhEditor.js';
import { setSiteOption } from '../steps/setSiteOption.js';
import { changeAdminColorScheme } from '../steps/changeAdminColorScheme.js';
import { disableWelcomeGuides } from '../steps/disableWelcomeGuides.js';
import { renameDefaultCategory } from '../steps/renameDefaultCategory.js';
import { removeDashboardWidgets } from '../steps/removeDashboardWidgets.js';
import { showAdminNotice } from '../steps/showAdminNotice.js';
import { login } from '../steps/login.js';
import { addCorsProxy } from '../steps/addCorsProxy.js';
import { installPhpLiteAdmin } from '../steps/installPhpLiteAdmin.js';
import { installAdminer } from '../steps/installAdminer.js';
import { runWpCliCommand } from '../steps/runWpCliCommand.js';
import { doAction } from '../steps/doAction.js';
import { defineWpConfigConst } from '../steps/defineWpConfigConst.js';
import { addClientRole } from '../steps/addClientRole.js';
import { fakeHttpResponse } from '../steps/fakeHttpResponse.js';
import { setLandingPage } from '../steps/setLandingPage.js';
import { addPost } from '../steps/addPost.js';
import { enableMultisite } from '../steps/enableMultisite.js';
import { setTT4Homepage } from '../steps/setTT4Homepage.js';
import { addFilter } from '../steps/addFilter.js';
import { githubPlugin } from '../steps/githubPlugin.js';
import { githubPluginRelease } from '../steps/githubPluginRelease.js';
import { installPlugin } from '../steps/installPlugin.js';
import { skipWooCommerceWizard } from '../steps/skipWooCommerceWizard.js';
import { jetpackOfflineMode } from '../steps/jetpackOfflineMode.js';
import { githubTheme } from '../steps/githubTheme.js';
import { installTheme } from '../steps/installTheme.js';
import { importWordPressComExport } from '../steps/importWordPressComExport.js';
import { importFriendFeeds } from '../steps/importFriendFeeds.js';
import { importWxr } from '../steps/importWxr.js';
import { blueprintRecorder } from '../steps/blueprintRecorder.js';
import { blueprintExtractor } from '../steps/blueprintExtractor.js';
import { githubImportExportWxr } from '../steps/githubImportExportWxr.js';
import { addProduct } from '../steps/addProduct.js';
import { customPostType } from '../steps/customPostType.js';
import { muPlugin } from '../steps/muPlugin.js';
import { addMedia } from '../steps/addMedia.js';
import { createUser } from '../steps/createUser.js';
import { runPHP } from '../steps/runPHP.js';
import { sampleContent } from '../steps/sampleContent.js';
import { setLanguage } from '../steps/setLanguage.js';
import { setSiteName } from '../steps/setSiteName.js';
import { generateProducts } from '../steps/generateProducts.js';
import { blockExamples } from '../steps/blockExamples.js';
import { debug } from '../steps/debug.js';

/**
 * Registry of all available steps using ES6 object property shorthand
 * This eliminates the need to name each step twice
 */
export const stepsRegistry = {
    defineWpConfigConst,
    importWxr,
    installPlugin,
    installTheme,
    login,
    runPHP,
    setSiteOption,

    addClientRole,
    addCorsProxy,
    addFilter,
    addMedia,
    addPage,
    addPost,
    addProduct,
    blueprintExtractor,
    blueprintRecorder,
    changeAdminColorScheme,
    createUser,
    customPostType,
    deleteAllPosts,
    disableWelcomeGuides,
    doAction,
    fakeHttpResponse,
    githubImportExportWxr,
    githubPlugin,
    githubPluginRelease,
    githubTheme,
    importFriendFeeds,
    importWordPressComExport,
    installAdminer,
    installPhEditor,
    installPhpLiteAdmin,
    jetpackOfflineMode,
    muPlugin,
    removeDashboardWidgets,
    renameDefaultCategory,
    runWpCliCommand,
    sampleContent,
    setLandingPage,
    setLanguage,
    setSiteName,
    setTT4Homepage,
    showAdminNotice,
    skipWooCommerceWizard,
    enableMultisite,
    generateProducts,
    blockExamples,
    debug,
};