// Types for WordPress Playground Step Library

import type {
	StepDefinition,
	Blueprint as WPBlueprint,
	BlueprintDeclaration as WPBlueprintDeclaration,
	BlueprintV1Declaration,
	BlueprintV2Declaration,
	InstallPluginStep as WPInstallPluginStep,
	InstallThemeStep as WPInstallThemeStep,
	RunPHPStep as WPRunPHPStep,
	LoginStep as WPLoginStep,
	ImportWxrStep as WPImportWxrStep,
	DefineWpConfigConstsStep as WPDefineWpConfigConstsStep,
	SetSiteOptionsStep as WPSetSiteOptionsStep,
	FileReference
} from '@wp-playground/blueprints';

export interface BlueprintStep {
    step: string;
    progress?: {
        caption?: string;
        weight?: number;
    };
    [key: string]: any;
}

export interface StepVariable {
    name: string;
    description?: string;
    type?: 'text' | 'textarea' | 'boolean' | 'number' | 'select' | 'url' | 'button' | 'post' | 'page' | 'custom_type' | 'POST';
    language?: 'php' | 'markup' | 'html' | 'xml' | 'css' | 'javascript' | 'text';
    required?: boolean;
    samples?: string[];
    options?: string[];
    show?: Function;
    label?: string;
    onclick?: Function;
    regex?: string;
    deprecated?: boolean;
}

export interface StepResult {
    toV1(): BlueprintV1Declaration | any[] | any;
    toV2(): BlueprintV2Declaration | any;
}

/**
 * Helper function to convert v1 blueprint result to v2 blueprint with additionalStepsAfterExecution.
 * Use this in toV2() when you want to reuse the v1 implementation.
 * Handles steps, landingPage, and login properties.
 */
export function v1ToV2Fallback(v1Result: BlueprintV1Declaration): BlueprintV2Declaration {
    const result: BlueprintV2Declaration = {
        version: 2
    };

    if (v1Result.steps && v1Result.steps.length > 0) {
        // Filter out falsy values and cast to the expected type
        const validSteps = v1Result.steps.filter((s): s is StepDefinition => !!s && typeof s === 'object');
        if (validSteps.length > 0) {
            (result as any).additionalStepsAfterExecution = validSteps;
        }
    }

    if (v1Result.landingPage !== undefined || v1Result.login !== undefined) {
        result.applicationOptions = {
            'wordpress-playground': {}
        };

        if (v1Result.landingPage !== undefined) {
            result.applicationOptions!['wordpress-playground'].landingPage = v1Result.landingPage;
        }

        if (v1Result.login !== undefined) {
            result.applicationOptions!['wordpress-playground'].login = v1Result.login;
        }
    }

    return result;
}

export interface StepFunction<T extends BlueprintStep = BlueprintStep> {
    (step: T, blueprint?: any): StepResult;
    description?: string;
    vars?: StepVariable[];
    builtin?: boolean;
    count?: number;
    multiple?: boolean;
    deprecated?: boolean;
}

// Step-specific interfaces (flattened, no vars wrapper)
export interface AddPageStep extends BlueprintStep {
    title?: string;
    content?: string;
    // Backward compatibility
    postTitle?: string;
    postContent?: string;
    homepage?: boolean;
}

export interface SetSiteNameStep extends BlueprintStep {
    sitename: string;
    tagline: string;
}

export interface SetLanguageStep extends BlueprintStep {
    language: string;
}

export interface SampleContentStep extends BlueprintStep {
    // No parameters needed
}

export interface CreateUserStep extends BlueprintStep {
    username: string;
    password: string;
    role: string;
    display_name?: string;
    email?: string;
    login?: boolean;
}

export interface RunPHPStep extends BlueprintStep {
    code: string;
}

export interface RunWpCliCommandStep extends BlueprintStep {
    command: string;
}

export interface DeleteAllPostsStep extends BlueprintStep {
    // No parameters needed
}

export interface InstallPhEditorStep extends BlueprintStep {
    // No parameters needed
}

export interface SkipWooCommerceWizardStep extends BlueprintStep {
    // No parameters needed
}

export interface DisableWelcomeGuidesStep extends BlueprintStep {
    // No parameters needed
}

export interface RenameDefaultCategoryStep extends BlueprintStep {
    categoryName: string;
    categorySlug?: string;
}

export interface SetSiteOptionStep extends BlueprintStep {
    name: string | string[];
    value: string | string[];
}

export interface ChangeAdminColorSchemeStep extends BlueprintStep {
    colorScheme: string;
}

export interface ShowAdminNoticeStep extends BlueprintStep {
    text: string;
    type?: string;
    dismissible?: boolean;
    stepIndex?: number;
}

export interface RemoveDashboardWidgetsStep extends BlueprintStep {
    welcome?: boolean;
    glance?: boolean;
    events?: boolean;
    quickpress?: boolean;
    activity?: boolean;
    sitehealth?: boolean;
}

export interface FakeHttpResponseStep extends BlueprintStep {
    url: string;
    response: string;
}

export interface DefineWpConfigConstStep extends BlueprintStep {
    name: string | string[];
    value: any | any[];
}

export interface DoActionStep extends BlueprintStep {
    action: string;
    parameter1?: string;
    parameter2?: string;
    parameter3?: string;
    parameter4?: string;
    parameter5?: string;
}

export interface AddClientRoleStep extends BlueprintStep {
    displayName: string;
}

export interface LoginStep extends BlueprintStep {
    username: string;
    password: string;
    landingPage?: boolean;
}

export interface DontLoginStep extends BlueprintStep {
    // No parameters needed
}

export interface InstallPhpLiteAdminStep extends BlueprintStep {
    // No parameters needed
}

export interface InstallAdminerStep extends BlueprintStep {
    // No parameters needed
}

export interface SetLandingPageStep extends BlueprintStep {
    landingPage: string;
}

export interface AddPostStep extends BlueprintStep {
    title?: string;
    content?: string;
    date?: string;
    type: string;
    status?: string;
    postId?: number;
    landingPage?: boolean;
    // Backward compatibility
    postTitle?: string;
    postContent?: string;
    postDate?: string;
    postType?: string;
    postStatus?: string;
    homepage?: boolean;
}

export interface EnableMultisiteStep extends BlueprintStep {
    // No parameters needed
}

export interface JetpackOfflineModeStep extends BlueprintStep {
    blocks?: boolean;
    subscriptions?: boolean;
}

export interface SetTT4HomepageStep extends BlueprintStep {
    // No parameters needed
}

export interface AddFilterStep extends BlueprintStep {
    filter: string;
    code: string;
    priority?: number;
    stepIndex?: number;
}

export interface GithubPluginStep extends BlueprintStep {
    url: string;
    prs?: boolean;
}

export interface GithubPluginReleaseStep extends BlueprintStep {
    repo: string;
    release: string;
    filename: string;
}

export interface InstallPluginStep extends BlueprintStep {
    url: string;
    prs?: boolean;
}

export interface InstallThemeStep extends BlueprintStep {
    url: string;
    prs?: boolean;
}

export interface GithubThemeStep extends BlueprintStep {
    url: string;
    prs?: boolean;
}

export interface ImportWordPressComExportStep extends BlueprintStep {
    url: string;
}

export interface ImportWxrStep extends BlueprintStep {
    file: string;
}

export interface ImportWxrFromUrlStep extends BlueprintStep {
    url: string;
}

export interface ImportFriendFeedsStep extends BlueprintStep {
    opml: string;
}

export interface AddMediaStep extends BlueprintStep {
    downloadUrl: string;
}

export interface AddProductStep extends BlueprintStep {
    title?: string;
    description?: string;
    price?: string;
    salePrice?: string;
    sku?: string;
    status?: string;
    // Backward compatibility
    productTitle?: string;
    productDescription?: string;
    productPrice?: string;
    productSalePrice?: string;
    productSku?: string;
    productStatus?: string;
}

export interface CustomPostTypeStep extends BlueprintStep {
    slug: string;
    name: string;
    supports?: string[];
    public?: boolean;
}

export interface MuPluginStep extends BlueprintStep {
    name: string;
    code: string;
}

export interface EnqueueCssStep extends BlueprintStep {
    filename: string;
    css: string;
    frontend?: boolean;
    wpAdmin?: boolean;
}

export interface EnqueueJsStep extends BlueprintStep {
    filename: string;
    js: string;
    frontend?: boolean;
    wpAdmin?: boolean;
}

export interface BlueprintRecorderStep extends BlueprintStep {
    // No parameters needed
}

export interface BlueprintExtractorStep extends BlueprintStep {
    // No parameters needed
}

export interface GithubImportExportWxrStep extends BlueprintStep {
    repo: string;
    branch?: string;
    filename?: string;
    targetUrl?: string;
}

// Union of all step types including both builtin WP steps and custom Step Library steps
export type StepLibraryStepDefinition = 
	// Builtin WP Playground steps
	StepDefinition |
	// Custom Step Library steps
	AddPageStep |
	SetSiteNameStep |
	SetLanguageStep |
	SampleContentStep |
	CreateUserStep |
	RunPHPStep |
	RunWpCliCommandStep |
	DeleteAllPostsStep |
	InstallPhEditorStep |
	SkipWooCommerceWizardStep |
	DisableWelcomeGuidesStep |
	RenameDefaultCategoryStep |
	SetSiteOptionStep |
	ChangeAdminColorSchemeStep |
	ShowAdminNoticeStep |
	RemoveDashboardWidgetsStep |
	FakeHttpResponseStep |
	DefineWpConfigConstStep |
	DoActionStep |
	AddClientRoleStep |
	LoginStep |
	InstallPhpLiteAdminStep |
	InstallAdminerStep |
	SetLandingPageStep |
	AddPostStep |
	EnableMultisiteStep |
	JetpackOfflineModeStep |
	SetTT4HomepageStep |
	AddFilterStep |
	GithubPluginStep |
	GithubPluginReleaseStep |
	InstallPluginStep |
	InstallThemeStep |
	GithubThemeStep |
	ImportWordPressComExportStep |
	ImportWxrStep |
	ImportWxrFromUrlStep |
	ImportFriendFeedsStep |
	AddMediaStep |
	AddProductStep |
	CustomPostTypeStep |
	MuPluginStep |
	EnqueueCssStep |
	EnqueueJsStep |
	BlueprintRecorderStep |
	BlueprintExtractorStep |
	GithubImportExportWxrStep |
	BlockExamplesStep;

// Extended Blueprint type that supports both builtin and Step Library custom steps
export interface StepLibraryBlueprintDeclaration extends Omit<WPBlueprintDeclaration, 'steps'> {
	steps?: Array<StepLibraryStepDefinition | string | undefined | false | null>;
}

export type StepLibraryBlueprint = StepLibraryBlueprintDeclaration;
export interface GenerateProductsStep extends BlueprintStep {
	count?: number;
	orders?: number;
	customers?: number;
	coupons?: number;
	categories?: number;
}

export interface BlockExamplesStep extends BlueprintStep {
	blockNamespace?: string;
	pluginSlug?: string;
	postTitle?: string;
	limit?: number;
	postId?: number;
	excludeCore?: boolean | string;
	landingPage?: boolean;
}
export interface DebugStep extends BlueprintStep {
	wpDebug?: boolean;
	wpDebugDisplay?: boolean;
	scriptDebug?: boolean;
	queryMonitor?: boolean;
}

