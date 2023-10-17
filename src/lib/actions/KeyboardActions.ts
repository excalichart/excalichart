export function clickEscapeKey(node: Node) {
	const handleClick = (event: KeyboardEvent) => {
		if (node && (event.key === 'Backspace' || event.key === 'Delete')) {
			//@ts-ignore
			node.dispatchEvent(new CustomEvent('escapeKeyPress', node));
		}
	};
	document.addEventListener('keydown', handleClick, true);

	return {
		destroy() {
			document.addEventListener('keydown', handleClick, true);
		}
	};
}
