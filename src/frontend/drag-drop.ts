/**
 * Drag and Drop utilities
 * Helper functions for drag and drop functionality
 */

/**
 * Get the element that should come after the dragged element at position y
 */
export function getDragAfterElement(container: Element, y: number): Element | undefined {
	const draggableElements = Array.from(container.querySelectorAll('.step'));

	return draggableElements.reduce((closest, child) => {
		const box = child.getBoundingClientRect();
		const offset = y - box.top - box.height / 2;
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: child };
		} else {
			return closest;
		}
	}, { offset: Number.NEGATIVE_INFINITY, element: undefined as Element | undefined }).element;
}
