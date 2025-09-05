// Import all step functions
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
 * Registry of all available steps using ES6 object property shorthand
 * This eliminates the need to name each step twice
 */
export const stepsRegistry = {
    // Builtin steps
    defineWpConfigConst,
    importWxr,
    installPlugin,
    installTheme,
    login,
    runPHP,
    setSiteOption,
    enableMultisite,
    
    // Custom steps
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
};