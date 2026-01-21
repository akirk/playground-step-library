import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface PHPRequestData {
	method?: 'GET' | 'POST' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'PUT' | 'DELETE';
	url: string;
	headers?: Record<string, string>;
	body?: string;
	formData?: Record<string, unknown>;
}

export interface RequestStep extends BlueprintStep {
	request: PHPRequestData;
}

export const request: StepFunction<RequestStep> = ( step: RequestStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'request',
					request: step.request
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

request.description = 'Request details (See.';
request.hidden = true;
request.vars = [
	{
		name: 'request',
		description: 'Request details (See',
		required: true,
	}
];
