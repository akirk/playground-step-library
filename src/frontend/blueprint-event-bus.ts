/**
 * Blueprint Event Bus
 * Decouples blueprint state changes from UI updates using pub-sub pattern
 */

import { BlueprintEvent, BlueprintEventType, BlueprintEventListener } from './blueprint-events';

class BlueprintEventBus {
	private listeners: Map<BlueprintEventType, Set<BlueprintEventListener>>;
	private eventQueue: BlueprintEvent[];
	private isProcessing: boolean;

	constructor() {
		this.listeners = new Map();
		this.eventQueue = [];
		this.isProcessing = false;
	}

	/**
	 * Subscribe to a blueprint event
	 */
	on(eventType: BlueprintEventType, listener: BlueprintEventListener): () => void {
		if (!this.listeners.has(eventType)) {
			this.listeners.set(eventType, new Set());
		}

		this.listeners.get(eventType)!.add(listener);

		// Return unsubscribe function
		return () => {
			this.off(eventType, listener);
		};
	}

	/**
	 * Unsubscribe from a blueprint event
	 */
	off(eventType: BlueprintEventType, listener: BlueprintEventListener): void {
		const listeners = this.listeners.get(eventType);
		if (listeners) {
			listeners.delete(listener);
		}
	}

	/**
	 * Emit a blueprint event
	 */
	emit(eventType: BlueprintEventType, data?: any, source?: string): void {
		const event: BlueprintEvent = {
			type: eventType,
			data,
			source
		};

		this.eventQueue.push(event);

		// Process events asynchronously to avoid nested event handling
		if (!this.isProcessing) {
			this.processEventQueue();
		}
	}

	/**
	 * Process queued events
	 */
	private async processEventQueue(): Promise<void> {
		this.isProcessing = true;

		while (this.eventQueue.length > 0) {
			const event = this.eventQueue.shift()!;
			const listeners = this.listeners.get(event.type);

			if (listeners) {
				// Call all listeners for this event type
				for (const listener of listeners) {
					try {
						listener(event);
					} catch (error) {
						console.error(`Error in blueprint event listener for ${event.type}:`, error);
					}
				}
			}
		}

		this.isProcessing = false;
	}

	/**
	 * Remove all listeners for a specific event type
	 */
	removeAllListeners(eventType?: BlueprintEventType): void {
		if (eventType) {
			this.listeners.delete(eventType);
		} else {
			this.listeners.clear();
		}
	}

	/**
	 * Get count of listeners for an event type
	 */
	listenerCount(eventType: BlueprintEventType): number {
		return this.listeners.get(eventType)?.size || 0;
	}
}

// Export singleton instance
export const blueprintEventBus = new BlueprintEventBus();
