/**
 * Save Dialog Controller
 * Manages the save blueprint dialog with overwrite/rename functionality
 */

import * as myBlueprints from './my-blueprints';
import { toastService } from './toast-service';
import { HistoryController } from './history-controller';

export interface SaveDialogControllerDependencies {
	historyController: HistoryController;
}

export class SaveDialogController {
	private deps: SaveDialogControllerDependencies;
	private dialog: HTMLDialogElement;
	private messageDiv: HTMLElement;
	private nameInput: HTMLInputElement;
	private nameLabel: HTMLElement;
	private overwriteBtn: HTMLElement;
	private renameBtn: HTMLElement;
	private saveBtn: HTMLElement;
	private cancelBtn: HTMLElement;

	private boundHandleOverwrite: () => void;
	private boundHandleRename: () => void;
	private boundHandleSave: () => void;
	private boundHandleCancel: () => void;
	private boundHandleKeyDown: ( e: KeyboardEvent ) => void;

	private currentDefaultName: string = '';

	constructor( deps: SaveDialogControllerDependencies ) {
		this.deps = deps;
		this.dialog = document.getElementById( 'save-blueprint-dialog' ) as HTMLDialogElement;
		this.messageDiv = document.getElementById( 'save-blueprint-message' )!;
		this.nameInput = document.getElementById( 'save-blueprint-name' ) as HTMLInputElement;
		this.nameLabel = document.getElementById( 'save-blueprint-label' )!;
		this.overwriteBtn = document.getElementById( 'save-blueprint-overwrite' )!;
		this.renameBtn = document.getElementById( 'save-blueprint-rename' )!;
		this.saveBtn = document.getElementById( 'save-blueprint-save' )!;
		this.cancelBtn = document.getElementById( 'save-blueprint-cancel' )!;

		this.boundHandleOverwrite = this.handleOverwrite.bind( this );
		this.boundHandleRename = this.handleRename.bind( this );
		this.boundHandleSave = this.handleSave.bind( this );
		this.boundHandleCancel = this.handleCancel.bind( this );
		this.boundHandleKeyDown = this.handleKeyDown.bind( this );
	}

	show( defaultName: string, isOverwrite: boolean ): void {
		this.currentDefaultName = defaultName;
		this.nameInput.value = defaultName;

		if ( isOverwrite ) {
			this.showOverwriteMode();
		} else {
			this.showSaveMode();
		}

		this.attachEventListeners();
		this.dialog.showModal();

		if ( !isOverwrite ) {
			this.nameInput.select();
		}
	}

	private showOverwriteMode(): void {
		this.messageDiv.textContent = 'A blueprint with this name already exists. Do you want to overwrite it or choose a new name?';
		this.messageDiv.style.display = 'block';
		this.nameLabel.style.display = 'none';
		this.overwriteBtn.style.display = 'inline-block';
		this.renameBtn.style.display = 'inline-block';
		this.saveBtn.style.display = 'none';
	}

	private showSaveMode(): void {
		this.messageDiv.textContent = '';
		this.messageDiv.style.display = 'none';
		this.nameLabel.style.display = 'block';
		this.overwriteBtn.style.display = 'none';
		this.renameBtn.style.display = 'none';
		this.saveBtn.style.display = 'inline-block';
	}

	private handleOverwrite(): void {
		const title = this.currentDefaultName;
		const history = myBlueprints.getHistory();
		const updatedHistory = history.filter( entry => entry.title !== title );
		myBlueprints.saveHistory( updatedHistory );

		this.deps.historyController.addToHistory( title );
		this.updateTitleInput( title );
		toastService.showGlobal( 'Updated' );
		this.deps.historyController.renderHistoryList();

		this.close();
	}

	private handleRename(): void {
		this.showSaveMode();
		this.nameInput.select();
	}

	private handleSave(): void {
		const title = this.nameInput.value.trim();
		if ( !title ) {
			return;
		}

		const history = myBlueprints.getHistory();
		const existingEntry = history.find( entry => entry.title === title );

		if ( existingEntry ) {
			this.cleanup();
			this.show( title, true );
			return;
		}

		this.deps.historyController.addToHistory( title );
		this.updateTitleInput( title );
		toastService.showGlobal( 'Saved' );
		this.deps.historyController.renderHistoryList();

		this.close();
	}

	private handleCancel(): void {
		this.close();
	}

	private handleKeyDown( e: KeyboardEvent ): void {
		if ( e.key === 'Enter' && this.nameLabel.style.display !== 'none' ) {
			e.preventDefault();
			this.handleSave();
		} else if ( e.key === 'Escape' ) {
			e.preventDefault();
			this.handleCancel();
		}
	}

	private updateTitleInput( title: string ): void {
		const titleInputEl = document.getElementById( 'title' ) as HTMLInputElement;
		if ( titleInputEl ) {
			titleInputEl.value = title;
		}
	}

	private close(): void {
		this.dialog.close();
		this.cleanup();
	}

	private attachEventListeners(): void {
		this.overwriteBtn.addEventListener( 'click', this.boundHandleOverwrite );
		this.renameBtn.addEventListener( 'click', this.boundHandleRename );
		this.saveBtn.addEventListener( 'click', this.boundHandleSave );
		this.cancelBtn.addEventListener( 'click', this.boundHandleCancel );
		this.nameInput.addEventListener( 'keydown', this.boundHandleKeyDown );
	}

	private cleanup(): void {
		this.overwriteBtn.removeEventListener( 'click', this.boundHandleOverwrite );
		this.renameBtn.removeEventListener( 'click', this.boundHandleRename );
		this.saveBtn.removeEventListener( 'click', this.boundHandleSave );
		this.cancelBtn.removeEventListener( 'click', this.boundHandleCancel );
		this.nameInput.removeEventListener( 'keydown', this.boundHandleKeyDown );
	}
}
