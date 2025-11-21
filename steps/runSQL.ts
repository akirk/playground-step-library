import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface RunSQLStep extends BlueprintStep {
	sql: any;
}

export const runSQL: StepFunction<RunSQLStep> = ( step: RunSQLStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
			return {
				steps: [
					{
						step: 'runSql',
						sql: step.sql
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

runSQL.description = 'Execute SQL queries.';
runSQL.hidden = true;
runSQL.vars = [
	{
		name: 'sql',
		description: 'SQL query or file reference to execute',
		required: true,
		type: 'textarea',
		language: 'text'
	}
];
