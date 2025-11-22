/**
 * AI Instructions Controller
 * Handles the AI instructions dialog for generating markdown snippets
 */

import * as aceEditor from './ace-editor';
import * as aiInstructions from './ai-instructions-generator';
import * as urlController from './url-controller';
import { toastService } from './toast-service';
import { blueprintEventBus } from './blueprint-event-bus';
import { StepDefinition } from './types';

export interface AIInstructionsControllerDependencies {
	blueprintSteps: HTMLElement;
	customSteps: Record<string, StepDefinition>;
	moreOptionsMenu: HTMLElement | null;
}

const EXAMPLE_BRANCH = 'fix/bug-123';

export class AIInstructionsController {
	private deps: AIInstructionsControllerDependencies;
	private aiInstructionsDeps: aiInstructions.AIInstructionsGeneratorDependencies;
	private currentUrls: aiInstructions.BranchPlaceholderUrls | null = null;
	private currentUrlType: aiInstructions.AIInstructionsUrlType = 'step-library';
	private menuBtn: HTMLButtonElement;
	private urlTypeSelect: HTMLSelectElement;
	private dialog: HTMLDialogElement;
	private closeBtn: HTMLElement;
	private copyBtn: HTMLElement;

	constructor( deps: AIInstructionsControllerDependencies ) {
		this.deps = deps;
		this.aiInstructionsDeps = {
			blueprintSteps: deps.blueprintSteps,
			customSteps: deps.customSteps
		};

		this.menuBtn = document.getElementById( 'generate-ai-instructions-menu' ) as HTMLButtonElement;
		this.urlTypeSelect = document.getElementById( 'ai-instructions-url-type' ) as HTMLSelectElement;
		this.dialog = document.getElementById( 'ai-instructions-dialog' ) as HTMLDialogElement;
		this.closeBtn = document.getElementById( 'ai-instructions-close' ) as HTMLElement;
		this.copyBtn = document.getElementById( 'ai-instructions-copy' ) as HTMLElement;

		this.init();
	}

	private init(): void {
		this.updateMenuVisibility();

		blueprintEventBus.on( 'blueprint:updated', () => {
			this.updateMenuVisibility();
		} );

		this.menuBtn.addEventListener( 'click', () => this.handleMenuClick() );
		this.urlTypeSelect.addEventListener( 'change', () => this.handleUrlTypeChange() );
		this.closeBtn.addEventListener( 'click', () => this.handleClose() );
		this.copyBtn.addEventListener( 'click', () => this.handleCopy() );
	}

	private updateMenuVisibility(): void {
		if ( aiInstructions.hasGitHubUrls( this.aiInstructionsDeps ) ) {
			this.menuBtn.style.display = '';
		} else {
			this.menuBtn.style.display = 'none';
		}
	}

	private handleMenuClick(): void {
		if ( ( window as any ).goatcounter ) {
			( window as any ).goatcounter.count( {
				path: 'generate-ai-instructions',
				title: 'Generate AI Instructions',
				event: true
			} );
		}

		if ( this.deps.moreOptionsMenu ) this.deps.moreOptionsMenu.style.display = 'none';

		this.currentUrls = aiInstructions.generateBranchPlaceholderUrls( this.aiInstructionsDeps );
		this.currentUrlType = this.urlTypeSelect.value as aiInstructions.AIInstructionsUrlType;
		const markdown = aiInstructions.generateAIInstructions( this.aiInstructionsDeps, this.currentUrlType );

		if ( !markdown ) {
			toastService.showGlobal( 'Could not generate AI instructions.' );
			return;
		}

		this.dialog.showModal();
		aceEditor.initAIInstructionsAceEditor( markdown );
	}

	private handleUrlTypeChange(): void {
		const content = aceEditor.getAIInstructionsValue();
		if ( !content || !this.currentUrls ) {
			return;
		}

		const newUrlType = this.urlTypeSelect.value as aiInstructions.AIInstructionsUrlType;
		const oldUrl = this.currentUrls[this.currentUrlType];
		const newUrl = this.currentUrls[newUrlType];

		if ( !oldUrl || !newUrl ) {
			return;
		}

		const oldExampleUrl = oldUrl.replace( /BRANCH_NAME/g, EXAMPLE_BRANCH );
		const newExampleUrl = newUrl.replace( /BRANCH_NAME/g, EXAMPLE_BRANCH );

		let newContent = content.split( oldUrl ).join( newUrl );
		newContent = newContent.split( oldExampleUrl ).join( newExampleUrl );

		this.currentUrlType = newUrlType;
		aceEditor.initAIInstructionsAceEditor( newContent );
	}

	private handleClose(): void {
		this.dialog.close();
	}

	private async handleCopy(): Promise<void> {
		const content = aceEditor.getAIInstructionsValue();
		const success = await urlController.copyToClipboard( content );
		if ( success ) {
			this.dialog.close();
			toastService.showGlobal( 'Copied to clipboard!' );
		}
	}
}
