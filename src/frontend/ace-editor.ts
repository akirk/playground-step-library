import { AceEditorInstance } from './types';

let aceLoaded = false;
let aceLoading: Promise<void> | null = null;

export let blueprintAceEditor: AceEditorInstance = null;
export let historyBlueprintAceEditor: AceEditorInstance = null;
export let viewSourceAceEditor: AceEditorInstance = null;
export let aceEditor: AceEditorInstance = null;

export function getAceTheme(): string {
	const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	return isDark ? 'ace/theme/monokai' : 'ace/theme/textmate';
}

export async function loadAceEditor(): Promise<void> {
	if (aceLoaded) {
		return;
	}
	if (aceLoading) {
		return aceLoading;
	}

	aceLoading = (async () => {
		const loadScript = (src: string) => {
			return new Promise<void>((resolve, reject) => {
				const script = document.createElement('script');
				script.src = src;
				script.onload = () => resolve();
				script.onerror = reject;
				document.head.appendChild(script);
			});
		};

		await loadScript('vendor/ace/ace.js');
		await loadScript('vendor/ace/theme-textmate.js');
		await loadScript('vendor/ace/theme-monokai.js');
		(window as any).ace.config.set('basePath', 'vendor/ace');
		aceLoaded = true;
	})();

	return aceLoading;
}

export function updateAllAceEditorThemes(): void {
	const theme = getAceTheme();
	if (blueprintAceEditor) {
		blueprintAceEditor.setTheme(theme);
	}
	if (historyBlueprintAceEditor) {
		historyBlueprintAceEditor.setTheme(theme);
	}
	if (aceEditor) {
		aceEditor.setTheme(theme);
	}
	if (viewSourceAceEditor) {
		viewSourceAceEditor.setTheme(theme);
	}
}

export function updateAceStatusBar(
	editor: AceEditorInstance,
	statusElement: HTMLElement,
	modeName: string,
	showManualEditWarning = false
): void {
	const cursor = editor.getCursorPosition();
	const line = cursor.row + 1;
	const col = cursor.column + 1;
	const content = editor.getValue();

	const lines = editor.getSession().getLength();
	const chars = content.length;
	const words = content.trim() ? content.trim().split(/\s+/).length : 0;

	const formatNumber = (num: number) => num.toLocaleString('en-US');

	const selection = editor.getSelectedText();
	const selectionInfo = selection ? `, ${formatNumber(selection.length)} chars selected` : '';

	statusElement.textContent = '';

	if (showManualEditWarning) {
		const warningSpan = document.createElement('span');
		warningSpan.className = 'status-warning';
		warningSpan.id = 'resume-compilation-status';
		warningSpan.title = 'Click to resume auto-compilation';
		statusElement.appendChild(warningSpan);
	}

	const infoSpan = document.createElement('span');
	infoSpan.className = 'status-info';
	infoSpan.textContent = `Ln ${line}, Col ${col} | ${formatNumber(lines)} lines, ${formatNumber(chars)} chars${selectionInfo}`;
	statusElement.appendChild(infoSpan);

	const modeSpan = document.createElement('span');
	modeSpan.className = 'status-mode';
	modeSpan.textContent = modeName;
	statusElement.appendChild(modeSpan);
}

export function initBlueprintAceEditor(
	getBlueprintValue: () => string,
	isManualEditMode: { value: boolean },
	transformJson: () => void
): void {
	if (blueprintAceEditor) {
		blueprintAceEditor.focus();
		return;
	}

	const textarea = document.getElementById('blueprint-compiled') as HTMLTextAreaElement;
	const currentValue = textarea.value;
	const wrapper = document.getElementById('blueprint-compiled-wrapper') as HTMLElement;
	const wrapperHeight = wrapper.offsetHeight;

	initializeAceEditor(textarea, currentValue, wrapperHeight, getBlueprintValue, isManualEditMode, transformJson);
}

function initializeAceEditor(
	textarea: HTMLTextAreaElement,
	currentValue: string,
	textareaHeight: number,
	getBlueprintValue: () => string,
	isManualEditMode: { value: boolean },
	transformJson: () => void
): void {
	loadAceEditor().then(() => {
		const wrapper = document.getElementById('blueprint-compiled-wrapper') as HTMLElement;

		if (textareaHeight > 0) {
			wrapper.style.height = textareaHeight + 'px';
		}

		const container = document.createElement('div');
		container.id = 'blueprint-compiled-ace';

		wrapper.insertBefore(container, textarea);
		textarea.style.display = 'none';

		blueprintAceEditor = (window as any).ace.edit(container);
		blueprintAceEditor.setTheme(getAceTheme());
		blueprintAceEditor.session.setMode('ace/mode/json');
		blueprintAceEditor.setFontSize(14);
		blueprintAceEditor.setShowPrintMargin(false);
		blueprintAceEditor.session.setUseWrapMode(true);
		blueprintAceEditor.session.setTabSize(2);
		blueprintAceEditor.session.setUseSoftTabs(true);
		blueprintAceEditor.setValue(currentValue, -1);
		blueprintAceEditor.setOptions({
			highlightActiveLine: true,
			highlightGutterLine: true
		});

		const blueprintStatus = document.getElementById('blueprint-status') as HTMLElement;
		blueprintStatus.classList.add('active');

		const updateBlueprintStatus = () => {
			updateAceStatusBar(blueprintAceEditor, blueprintStatus, 'JSON', isManualEditMode.value);
		};

		blueprintAceEditor.getSession().on('change', () => {
			textarea.value = blueprintAceEditor.getValue();
			if (!isManualEditMode.value) {
				isManualEditMode.value = true;
				updateBlueprintStatus();
			}
		});

		blueprintAceEditor.commands.addCommand({
			name: 'closeEditorAndResume',
			bindKey: { win: 'Esc', mac: 'Esc' },
			exec: function () {
				if (blueprintAceEditor) {
					const aceContainer = document.getElementById('blueprint-compiled-ace');
					if (aceContainer) {
						blueprintAceEditor.destroy();
						aceContainer.remove();
					}
					blueprintAceEditor = null;
					textarea.style.display = '';
					document.getElementById('blueprint-status')!.classList.remove('active');
				}
				isManualEditMode.value = false;
				updateBlueprintStatus();
				transformJson();
			}
		});

		blueprintAceEditor.getSession().selection.on('changeCursor', updateBlueprintStatus);
		blueprintAceEditor.getSession().selection.on('changeSelection', updateBlueprintStatus);
		updateBlueprintStatus();

		blueprintStatus.addEventListener('click', function (e) {
			if ((e.target as HTMLElement).id === 'resume-compilation-status') {
				if (blueprintAceEditor) {
					const aceContainer = document.getElementById('blueprint-compiled-ace');
					if (aceContainer) {
						blueprintAceEditor.destroy();
						aceContainer.remove();
					}
					blueprintAceEditor = null;
					textarea.style.display = '';
					blueprintStatus.classList.remove('active');
				}
				isManualEditMode.value = false;
				transformJson();
			}
		});

		setTimeout(() => {
			blueprintAceEditor.resize();
			blueprintAceEditor.renderer.updateFull();
			blueprintAceEditor.focus();
		}, 0);

		setTimeout(() => {
			blueprintAceEditor.resize();
		}, 200);

		window.addEventListener('resize', () => {
			if (blueprintAceEditor) {
				blueprintAceEditor.resize();
			}
		});
	}).catch(err => {
		console.error('Failed to load Ace Editor:', err);
		textarea.style.display = '';
	});
}

export function cleanupHistoryBlueprintAceEditor(): void {
	if (historyBlueprintAceEditor) {
		historyBlueprintAceEditor.destroy();
		const aceContainer = document.getElementById('history-blueprint-ace');
		if (aceContainer) {
			aceContainer.remove();
		}
		historyBlueprintAceEditor = null;
		const textarea = document.getElementById('history-blueprint-view') as HTMLTextAreaElement;
		if (textarea) {
			textarea.style.display = '';
		}
		const statusBar = document.getElementById('history-blueprint-status') as HTMLElement;
		if (statusBar) {
			statusBar.classList.remove('active');
			statusBar.textContent = '';
		}
	}
}

export function initHistoryBlueprintAceEditor(): void {
	if (historyBlueprintAceEditor) {
		historyBlueprintAceEditor.resize();
		return;
	}

	const textarea = document.getElementById('history-blueprint-view') as HTMLTextAreaElement;
	const currentValue = textarea.value;

	loadAceEditor().then(() => {
		const wrapper = document.getElementById('history-blueprint-wrapper') as HTMLElement;
		const container = document.createElement('div');
		container.id = 'history-blueprint-ace';

		wrapper.insertBefore(container, textarea);
		textarea.style.display = 'none';

		historyBlueprintAceEditor = (window as any).ace.edit(container);
		historyBlueprintAceEditor.setTheme(getAceTheme());
		historyBlueprintAceEditor.session.setMode('ace/mode/json');
		historyBlueprintAceEditor.setFontSize(14);
		historyBlueprintAceEditor.setShowPrintMargin(false);
		historyBlueprintAceEditor.session.setUseWrapMode(true);
		historyBlueprintAceEditor.session.setTabSize(2);
		historyBlueprintAceEditor.session.setUseSoftTabs(true);
		historyBlueprintAceEditor.setValue(currentValue, -1);
		historyBlueprintAceEditor.setReadOnly(true);
		historyBlueprintAceEditor.setOptions({
			highlightActiveLine: false,
			highlightGutterLine: false
		});

		const historyBlueprintStatus = document.getElementById('history-blueprint-status') as HTMLElement;
		historyBlueprintStatus.classList.add('active');

		const updateHistoryStatus = () => {
			updateAceStatusBar(historyBlueprintAceEditor, historyBlueprintStatus, 'JSON (Read-only)');
		};

		historyBlueprintAceEditor.getSession().selection.on('changeCursor', updateHistoryStatus);
		historyBlueprintAceEditor.getSession().selection.on('changeSelection', updateHistoryStatus);
		updateHistoryStatus();

		setTimeout(() => {
			historyBlueprintAceEditor.resize();
			historyBlueprintAceEditor.renderer.updateFull();
		}, 0);

		window.addEventListener('resize', () => {
			if (historyBlueprintAceEditor) {
				historyBlueprintAceEditor.resize();
			}
		});
	}).catch(err => {
		console.error('Failed to load Ace Editor for history view:', err);
		textarea.style.display = '';
	});
}

export function initCodeEditorAce(
	linkedTextarea: HTMLTextAreaElement,
	language: string,
	loadCombinedExamples: () => void
): void {
	const dialog = document.getElementById('code-editor') as HTMLDialogElement;
	const editorContainer = document.getElementById('code-editor-container') as HTMLElement;
	editorContainer.textContent = '';

	dialog.showModal();

	const languageMap: Record<string, string> = {
		'php': 'php',
		'markup': 'html',
		'html': 'html',
		'xml': 'xml',
		'none': 'text',
		'text': 'text'
	};
	const aceMode = languageMap[language] || 'text';

	loadAceEditor().then(() => {
		if (aceEditor) {
			aceEditor.destroy();
		}

		aceEditor = (window as any).ace.edit(editorContainer, {
			mode: `ace/mode/${aceMode}`,
			theme: getAceTheme(),
			fontSize: 14,
			showPrintMargin: false,
			wrap: true,
			value: linkedTextarea.value,
			highlightActiveLine: true,
			highlightGutterLine: true
		});

		aceEditor.getSession().on('change', () => {
			linkedTextarea.value = aceEditor.getValue();
			loadCombinedExamples();
		});

		const codeEditorStatus = document.getElementById('code-editor-status') as HTMLElement;
		const modeDisplayName: Record<string, string> = {
			'php': 'PHP',
			'html': 'HTML',
			'xml': 'XML',
			'text': 'Plain Text'
		};
		const displayName = modeDisplayName[aceMode] || aceMode.toUpperCase();

		const updateCodeEditorStatus = () => {
			updateAceStatusBar(aceEditor, codeEditorStatus, displayName);
		};

		aceEditor.getSession().selection.on('changeCursor', updateCodeEditorStatus);
		aceEditor.getSession().selection.on('changeSelection', updateCodeEditorStatus);
		updateCodeEditorStatus();

		setTimeout(() => {
			aceEditor.resize();
			aceEditor.renderer.updateFull();
			aceEditor.focus();
		}, 0);
	});
}

export function initViewSourceAceEditor(sourceUrl: string): void {
	const dialog = document.getElementById('view-source') as HTMLDialogElement;
	const fileName = sourceUrl.split('/').slice(-1)[0];
	const stepName = fileName.replace(/\.ts$/, '');
	dialog.querySelector('h2')!.textContent = fileName;

	const docsLink = dialog.querySelector('#view-source-docs') as HTMLAnchorElement;
	const docsUrl = `https://github.com/akirk/playground-step-library/blob/main/docs/steps/${stepName}.md`;
	docsLink.href = docsUrl;
	docsLink.style.display = '';

	Promise.all([loadAceEditor(), fetch(sourceUrl)])
		.then(([_, response]) => {
			if (!response.ok) {
				throw new Error('Failed to load source file');
			}
			return response.text();
		})
		.then(sourceCode => {
			if (!viewSourceAceEditor) {
				viewSourceAceEditor = (window as any).ace.edit('view-source-editor');
				viewSourceAceEditor.setTheme(getAceTheme());
				viewSourceAceEditor.session.setMode('ace/mode/typescript');
				viewSourceAceEditor.setFontSize(14);
				viewSourceAceEditor.setShowPrintMargin(false);
				viewSourceAceEditor.setReadOnly(true);
				viewSourceAceEditor.session.setUseWrapMode(true);

				const viewSourceStatus = document.getElementById('view-source-status') as HTMLElement;
				viewSourceStatus.classList.add('active');

				const updateViewSourceStatus = () => {
					updateAceStatusBar(viewSourceAceEditor, viewSourceStatus, 'TypeScript (Read-only)');
				};

				viewSourceAceEditor.getSession().selection.on('changeCursor', updateViewSourceStatus);
				viewSourceAceEditor.getSession().selection.on('changeSelection', updateViewSourceStatus);
			}

			viewSourceAceEditor.setValue(sourceCode, -1);

			const viewSourceStatus = document.getElementById('view-source-status') as HTMLElement;
			const updateViewSourceStatus = () => {
				updateAceStatusBar(viewSourceAceEditor, viewSourceStatus, 'TypeScript (Read-only)');
			};
			updateViewSourceStatus();

			document.body.classList.add('dialog-open');
			dialog.showModal();
		})
		.catch(error => {
			console.error('Error loading source:', error);
			alert('Failed to load source file: ' + error.message);
		});
}

export function cleanupAceEditor(): void {
	if (aceEditor) {
		aceEditor.destroy();
		aceEditor = null;
	}
}

export function setBlueprintAceValue(value: string): void {
	if (blueprintAceEditor) {
		blueprintAceEditor.setValue(value, -1);
	}
}
