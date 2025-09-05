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
	(step: StepInput): StepDefinition[];
	description: string;
	vars: StepVariable[];
}

export interface CustomSteps {
	[stepName: string]: StepFunction;
}