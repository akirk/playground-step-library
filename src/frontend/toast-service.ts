/**
 * Toast Notification Service
 * Centralized toast notification system for user feedback
 */

export interface ToastOptions {
	duration?: number;
	showUndo?: boolean;
	undoCallback?: () => void;
	undoLabel?: string;
}

class ToastService {
	private deleteUndoTimeout: number | null = null;
	private lastDeletedEntry: any = null;

	/**
	 * Show a global toast message (always visible)
	 */
	showGlobal(message: string, options: ToastOptions = {}): void {
		const duration = options.duration || 3000;
		const toast = document.getElementById('global-toast');
		const toastMessage = document.getElementById('global-toast-message');
		const undoBtn = document.getElementById('global-toast-undo');

		if (!toast || !toastMessage || !undoBtn) return;

		toastMessage.textContent = message;
		undoBtn.style.display = 'none';
		toast.style.display = 'flex';

		if (this.deleteUndoTimeout) {
			clearTimeout(this.deleteUndoTimeout);
		}

		this.deleteUndoTimeout = window.setTimeout(() => {
			toast.style.display = 'none';
		}, duration);
	}

	/**
	 * Show a toast message inside the My Blueprints dialog with optional undo button
	 */
	showInBlueprintsDialog(message: string, undoCallback?: () => void): void {
		const duration = undoCallback ? 5000 : 3000;
		const toast = document.getElementById('blueprints-dialog-toast');
		const toastMessage = document.getElementById('blueprints-dialog-toast-message');
		const undoBtn = document.getElementById('blueprints-dialog-toast-undo');

		if (!toast || !toastMessage || !undoBtn) return;

		toastMessage.textContent = message;

		if (undoCallback) {
			undoBtn.textContent = 'Undo';
			undoBtn.style.display = 'inline-block';
			undoBtn.onclick = () => {
				if (this.deleteUndoTimeout) {
					clearTimeout(this.deleteUndoTimeout);
				}
				toast.style.display = 'none';
				undoCallback();
			};
		} else {
			undoBtn.style.display = 'none';
		}

		toast.style.display = 'flex';

		if (this.deleteUndoTimeout) {
			clearTimeout(this.deleteUndoTimeout);
		}

		this.deleteUndoTimeout = window.setTimeout(() => {
			toast.style.display = 'none';
			this.lastDeletedEntry = null;
		}, duration);
	}

	/**
	 * Show global toast with custom action button
	 */
	showGlobalWithAction(message: string, actionLabel: string, onAction: () => void): void {
		const toast = document.getElementById('global-toast');
		const toastMessage = document.getElementById('global-toast-message');
		const undoBtn = document.getElementById('global-toast-undo');

		if (!toast || !toastMessage || !undoBtn) return;

		toastMessage.textContent = message;
		undoBtn.textContent = actionLabel;
		undoBtn.style.display = 'inline-block';
		toast.style.display = 'flex';

		undoBtn.onclick = () => {
			this.hide();
			onAction();
		};
	}

	/**
	 * Hide the global toast notification
	 */
	hide(): void {
		const toast = document.getElementById('global-toast');
		if (toast) {
			toast.style.display = 'none';
		}
		const undoBtn = document.getElementById('global-toast-undo');
		if (undoBtn) {
			undoBtn.textContent = 'Undo';
		}
	}

	/**
	 * Get/set last deleted entry for undo functionality
	 */
	getLastDeletedEntry(): any {
		return this.lastDeletedEntry;
	}

	setLastDeletedEntry(entry: any): void {
		this.lastDeletedEntry = entry;
	}
}

// Export singleton instance
export const toastService = new ToastService();
