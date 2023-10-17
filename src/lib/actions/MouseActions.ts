/** Dispatch event on click outside of node
 *
 *  In the future, there will be a need to
 *  attach a mouse Id to each of these
 *
 *  This will also have to be explored on cell phones.
 */
import { onDestroy } from 'svelte';
import { isMouseDown } from '$lib/io/Stores';

function clickOutside(node: HTMLElement, options: any = {}) {
	const handleClick = (event: MouseEvent) => {
		if (options.exclude && options.exclude.contains(event.target)) {
			return;
		}
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('click_outside'));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

function clickInside(node: HTMLElement, options: any = {}) {
	const handleClick = (event: MouseEvent) => {
		if (options.exclude && options.exclude.contains(event.target)) {
			return;
		}
		if (node && node.contains(event.target as Node)) {
			node.dispatchEvent(new CustomEvent('click_inside'));
		}
	};
	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

function mouseMove(node: Node, { onMove }: { onMove: (x: number, y: number) => void }) {
	let mouseDownValue: boolean;

	//@ts-ignore
	const handleMouseMove = (e) => {
		if (!mouseDownValue) {
			onMove(e.clientX, e.clientY);
		}
	};

	node.addEventListener('mousemove', handleMouseMove);

	const unsubscribe = isMouseDown.subscribe((value) => {
		mouseDownValue = value;
	});

	onDestroy(unsubscribe);

	return {
		destroy() {
			node.removeEventListener('mousemove', handleMouseMove);
		}
	};
}

function touchStart(node: Node, { onStart }: { onStart: (x: number, y: number) => void }) {
	//@ts-ignore
	const handleMouseDown = (e) => {
		onStart(e.clientX, e.clientY);
	};

	//@ts-ignore
	const handleTouchStart = (e) => {
		const touch = e.touches[0];
		onStart(touch.clientX, touch.clientY);
	};

	node.addEventListener('mousedown', handleMouseDown);
	node.addEventListener('touchstart', handleTouchStart);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMouseDown);
			node.removeEventListener('touchstart', handleTouchStart);
		}
	};
}

function touchMove(node: Node, { onMove }: { onMove: (x: number, y: number) => void }) {
	let mouseDownValue: boolean;

	//@ts-ignore
	const handleMouseMove = (e) => {
		if (mouseDownValue) {
			onMove(e.clientX, e.clientY);
		}
	};

	//@ts-ignore
	const handleTouchMove = (e) => {
		if (mouseDownValue) {
			const touch = e.touches[0];
			onMove(touch.clientX, touch.clientY);
		}
	};

	node.addEventListener('mousemove', handleMouseMove);
	node.addEventListener('touchmove', handleTouchMove);

	const unsubscribe = isMouseDown.subscribe((value) => {
		mouseDownValue = value;
	});

	onDestroy(unsubscribe);

	return {
		destroy() {
			node.removeEventListener('mousemove', handleMouseMove);
			node.removeEventListener('touchmove', handleTouchMove);
		}
	};
}

function trackMouseState(node: Node) {
	const handleMouseDown = () => {
		isMouseDown.set(true);
	};

	const handleMouseUp = () => {
		isMouseDown.set(false);
	};

	node.addEventListener('mousedown', handleMouseDown);
	node.addEventListener('mouseup', handleMouseUp);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMouseDown);
			node.removeEventListener('mouseup', handleMouseUp);
		}
	};
}
function touchEnd(node: Node, { onEnd }: { onEnd: (x: number, y: number) => void }) {
	//@ts-ignore
	const handleMouseUp = (e) => {
		onEnd(e.clientX, e.clientY);
	};
	isMouseDown.set(false);

	//@ts-ignore
	const handleTouchEnd = (e) => {
		if (e.changedTouches && e.changedTouches[0]) {
			const touch = e.changedTouches[0];
			onEnd(touch.clientX, touch.clientY);
		}
	};

	node.addEventListener('mouseup', handleMouseUp);
	node.addEventListener('touchend', handleTouchEnd);

	return {
		destroy() {
			node.removeEventListener('mouseup', handleMouseUp);
			node.removeEventListener('touchend', handleTouchEnd);
		}
	};
}

function onMouseLeave(node: Node, { onLeave }: { onLeave: () => void }) {
	const handleMouseLeave = () => {
		onLeave();
		isMouseDown.set(false); // Add this line
	};

	node.addEventListener('mouseleave', handleMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseleave', handleMouseLeave);
		}
	};
}

export {
	onMouseLeave,
	touchEnd,
	touchMove,
	touchStart,
	mouseMove,
	trackMouseState,
	clickInside,
	clickOutside
};
