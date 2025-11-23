export interface StepVariable {
	name: string;
	description?: string;
	type?: 'text' | 'number' | 'boolean' | 'textarea' | 'select' | 'button';
	samples?: any[];
	required?: boolean;
	regex?: string;
	deprecated?: boolean;
	show?: (stepBlock: HTMLElement) => boolean;
	setValue?: any | any[];
	onclick?: (event: Event, loadCombinedExamples: () => void) => void;
	options?: string[];
	label?: string;
	language?: string;
	placeholder?: string;
	default?: any;
}

export interface StepDefinition {
	step: string;
	name?: string;
	description?: string;
	info?: any;
	vars?: StepVariable[];
	count?: number;
	multiple?: boolean;
	mine?: boolean;
	builtin?: boolean;
	deprecated?: boolean;
	hidden?: boolean;
	date?: string;
}

export interface StepData {
	step: string;
	vars?: Record<string, any>;
	count?: number;
}

export interface AppState {
	steps: StepData[];
	title?: string;
	autosave?: string;
	playground?: string;
	mode?: string;
	previewMode?: string;
	excludeMeta?: boolean;
}

export interface WizardState {
	currentStep: number;
	totalSteps: number;
	selectedSteps: string[];
	selectedPlugins: string[];
	selectedThemes: string[];
	projectTitle: string;
	projectDescription: string;
	stepConfigurations: Record<string, Record<string, any>>;
}

export interface BlueprintHistoryEntry {
	id: number;
	date: string;
	title: string;
	compiledBlueprint: any;
	stepConfig: AppState;
}

export type AceEditorInstance = any;

export interface StepConfig {
	steps: StepData[];
	options?: {
		wpVersion?: string;
		phpVersion?: string;
		phpExtensionBundles?: boolean;
		mode?: string;
		storage?: string;
		autosave?: string;
		playground?: string;
		encodingFormat?: string;
		base64?: boolean;
		previewMode?: string;
	};
	title?: string;
}

export interface CombinedExamples {
	title?: string;
	landingPage: string;
	steps: any[];
}

export interface ShowCallbacks {
	[stepName: string]: {
		[varName: string]: (stepBlock: HTMLElement) => boolean;
	};
}
