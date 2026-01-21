import type { StepFunction, BlueprintStep, StepResult, FileReference } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface RunSqlStep extends BlueprintStep {
	sql: FileReference;
}

export const runSql: StepFunction<RunSqlStep> = ( step: RunSqlStep ): StepResult => {
	return {
		toV1() {
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

runSql.description = 'The step identifier.';
runSql.hidden = true;
runSql.vars = [
	{
		name: 'sql',
		description: 'The SQL to run. Each non-empty line must contain a valid SQL query.',
		required: true,
	}
];
