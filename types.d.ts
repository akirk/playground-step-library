import type { StepDefinition } from '@wp-playground/blueprints';

export interface StepVariable {
	name: string;
	description: string;
	required: boolean;
	type?: 'textarea' | 'boolean' | string;
	regex?: string;
	samples: string[];
	label?: string;
	onclick?: (event: Event, loadCombinedExamples: Function) => void;
}

export interface StepInput {
	vars: Record<string, any>;
}

export interface StepFunction {
	(step: BlueprintStep, inputData?: any): StepDefinition[];
	description: string;
	vars: StepVariable[];
	builtin?: boolean;
	multiple?: boolean;
	count?: number;
}

interface BlueprintStep {
	step: string;
	vars?: Record<string, any>;
	count?: number;
	[key: string]: any;
}

export interface CustomSteps {
	[stepName: string]: StepFunction;
}