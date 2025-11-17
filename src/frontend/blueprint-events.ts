/**
 * Blueprint Event Types
 * Event definitions for the blueprint event bus
 */

export type BlueprintEventType =
	| 'blueprint:updated'
	| 'blueprint:step-added'
	| 'blueprint:step-removed'
	| 'blueprint:step-reordered'
	| 'blueprint:compiled'
	| 'blueprint:loaded';

export interface BlueprintEvent {
	type: BlueprintEventType;
	data?: any;
	source?: string;
}

export interface BlueprintEventListener {
	(event: BlueprintEvent): void;
}
