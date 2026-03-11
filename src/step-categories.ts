export const STEP_CATEGORIES = [
	{ id: 'content', label: 'Content' },
	{ id: 'plugins-themes', label: 'Plugins & Themes' },
	{ id: 'users-settings', label: 'Users & Settings' },
	{ id: 'theme-dev', label: 'Theme Development' },
	{ id: 'code', label: 'Code & Scripting' },
	{ id: 'import-export', label: 'Import & Export' },
	{ id: 'admin-debug', label: 'Admin & Debug' },
	{ id: 'advanced', label: 'Advanced' },
] as const;

export const STEP_CATEGORY_MAP: Record<string, string> = {
	// Content
	addPage: 'content',
	addPost: 'content',
	addMedia: 'content',
	addProduct: 'content',
	blockExamples: 'content',
	deleteAllPosts: 'content',
	sampleContent: 'content',

	// Plugins & Themes
	installPlugin: 'plugins-themes',
	installTheme: 'plugins-themes',
	activatePlugin: 'plugins-themes',
	activateTheme: 'plugins-themes',
	githubPlugin: 'plugins-themes',
	githubPluginRelease: 'plugins-themes',
	githubTheme: 'plugins-themes',
	gitPlugin: 'plugins-themes',
	gitTheme: 'plugins-themes',

	// Users & Settings
	createUser: 'users-settings',
	addClientRole: 'users-settings',
	login: 'users-settings',
	dontLogin: 'users-settings',
	setSiteName: 'users-settings',
	setLanguage: 'users-settings',
	setSiteOption: 'users-settings',
	defineWpConfigConst: 'users-settings',
	changeAdminColorScheme: 'users-settings',
	setLandingPage: 'users-settings',
	setTT4Homepage: 'users-settings',
	renameDefaultCategory: 'users-settings',

	// Theme Development
	addTemplate: 'theme-dev',
	addTemplatePart: 'theme-dev',
	enqueueCss: 'theme-dev',
	enqueueJs: 'theme-dev',
	customPostType: 'theme-dev',

	// Code & Scripting
	runPHP: 'code',
	runWpCliCommand: 'code',
	doAction: 'code',
	addFilter: 'code',
	muPlugin: 'code',

	// Import & Export
	importWxr: 'import-export',
	importWordPressComExport: 'import-export',
	importFriendFeeds: 'import-export',
	siteHealthImport: 'import-export',
	githubImportExportWxr: 'import-export',

	// Admin & Debug
	removeDashboardWidgets: 'admin-debug',
	disableWelcomeGuides: 'admin-debug',
	showAdminNotice: 'admin-debug',
	debug: 'admin-debug',
	installAdminer: 'admin-debug',
	installPhpLiteAdmin: 'admin-debug',
	installPhEditor: 'admin-debug',

	// Advanced
	enableMultisite: 'advanced',
	enableIntl: 'advanced',
	jetpackOfflineMode: 'advanced',
	skipWooCommerceWizard: 'advanced',
	generateProducts: 'advanced',
	blueprintRecorder: 'advanced',
	blueprintExtractor: 'advanced',
	fakeHttpResponse: 'advanced',
};
