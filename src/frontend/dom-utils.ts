export function makeParentStepDraggable(event: Event): void {
	if (event.target instanceof Element) {
		const step = event.target.closest('.step');
		if (step) step.setAttribute('draggable', 'true');
	}
}

export function makeParentStepUnDraggable(event: Event): void {
	if (event.target instanceof Element) {
		const step = event.target.closest('.step');
		if (step) step.setAttribute('draggable', 'false');
	}
}

export function fixMouseCursor(el: Element): void {
	el.addEventListener('mouseenter', makeParentStepUnDraggable);
	el.addEventListener('mouseleave', makeParentStepDraggable);
}
