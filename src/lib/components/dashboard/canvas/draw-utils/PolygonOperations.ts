/**
 * Checks is a point is in any created polygon or shape.
 *
 * @param point
 * @param polygon
 * @returns boolean
 */
const isPointInPolygon = (point: Point, polygon: Polygon): boolean => {
	const x = point.x;
	const y = point.y;
	let inside = false;
	for (let i = 0, j = polygon.vertices.length - 1; i < polygon.vertices.length; j = i++) {
		const xi = polygon.vertices[i].x;
		const yi = polygon.vertices[i].y;
		const xj = polygon.vertices[j].x;
		const yj = polygon.vertices[j].y;

		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) {
			inside = !inside;
		}
	}
	return inside;
};

/**
 * Get Cursor Style From Direction
 *
 * @param direction
 * @returns string
 */
const getCursorStyleFromDirection = (direction: string): string => {
	const cursorMap: { [key: string]: string } = {
		n: 'ns-resize',
		ne: 'nesw-resize',
		e: 'ew-resize',
		se: 'nwse-resize',
		s: 'ns-resize',
		sw: 'nesw-resize',
		w: 'ew-resize',
		nw: 'nwse-resize',
		center: 'move'
	};
	return cursorMap[direction] || 'default';
};

/**
 * Manhattan Distance of two points with a tolerance
 *
 * @param mouseX
 * @param mouseY
 * @param pointX
 * @param pointY
 * @param tolerance
 * @returns
 */
const isNearPoint = (
	mouseX: number,
	mouseY: number,
	pointX: number,
	pointY: number,
	tolerance: number = 20
): boolean => {
	const diffX = Math.abs(mouseX - pointX);
	const diffY = Math.abs(mouseY - pointY);
	return diffX <= tolerance && diffY <= tolerance;
};

/**
 * Get the nearest surrounding polygon that a point that is in `x` and `y`.

 *  @param point the current point (mouse position, or other)
 *  @param polygons all the polygons that are on the canvas
*/
const getContainingPolygon = (point: Point, polygons: Polygon[]): Polygon | null => {
	let containedPolygon: Polygon | null = null;
	polygons.forEach((polygon) => {
		if (isPointInPolygon(point, polygon)) {
			if (!containedPolygon || polygon.vertices.length < containedPolygon.vertices.length) {
				containedPolygon = polygon;
			}
		}
	});
	return containedPolygon;
};

/**
 * Create the dynamic rectangles.
 *
 * @param polygon
 * @returns
 */
const calculateRectangleHandles = (polygon: Polygon): Point[] => {
	const { vertices } = polygon;
	let midPoints: Point[] = [];

	for (let i = 0; i < vertices.length; i++) {
		let nextIndex = (i + 1) % vertices.length;
		midPoints.push({
			x: (vertices[i].x + vertices[nextIndex].x) / 2,
			y: (vertices[i].y + vertices[nextIndex].y) / 2
		});
	}

	return vertices.concat(midPoints);
};

const doLinesIntersect = (a1: Point, a2: Point, b1: Point, b2: Point): boolean => {
	const crossProduct = (point1: Point, point2: Point, point3: Point) => {
		return (
			(point2.x - point1.x) * (point3.y - point1.y) - (point2.y - point1.y) * (point3.x - point1.x)
		);
	};

	const isPointOnSegment = (point1: Point, point2: Point, point: Point) => {
		return (
			point.x >= Math.min(point1.x, point2.x) &&
			point.x <= Math.max(point1.x, point2.x) &&
			point.y >= Math.min(point1.y, point2.y) &&
			point.y <= Math.max(point1.y, point2.y)
		);
	};

	const d1 = crossProduct(a1, a2, b1);
	const d2 = crossProduct(a1, a2, b2);
	const d3 = crossProduct(b1, b2, a1);
	const d4 = crossProduct(b1, b2, a2);

	// If d1 and d2 have opposite signs and d3 and d4 have opposite signs
	if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
		return true;
	}

	// Special cases where the endpoints are touching
	if (d1 === 0 && isPointOnSegment(a1, a2, b1)) return true;
	if (d2 === 0 && isPointOnSegment(a1, a2, b2)) return true;
	if (d3 === 0 && isPointOnSegment(b1, b2, a1)) return true;
	if (d4 === 0 && isPointOnSegment(b1, b2, a2)) return true;

	return false;
};

function generateHandleRectangles(points: LookupTable, handleSize: number = 10) {
	return Object.values(points).map((point) => ({
		x: point.x - handleSize / 2,
		y: point.y - handleSize / 2,
		width: handleSize,
		height: handleSize
	}));
}

const isWithinHandle = (
	mouseX: number,
	mouseY: number,
	handle: Point,
	handleType: HandlePosition,
	isTouchEvent: boolean = false
): boolean => {
	const handleSize = 10;
	const baseTolerance = 5;
	const touchIncreaseFactor = 3.2; // Adjust this value as needed for the desired increase in tolerance for touch

	const tolerance = isTouchEvent ? baseTolerance * touchIncreaseFactor : baseTolerance;

	let xOffset = handleSize / 2 + tolerance;
	let yOffset = handleSize / 2 + tolerance;

	if (handleType === 'n' || handleType === 's') {
		xOffset = handleSize / 2 + 2 * tolerance;
	} else if (handleType === 'e' || handleType === 'w') {
		yOffset = handleSize / 2 + 2 * tolerance;
	}

	return (
		mouseX > handle.x - xOffset &&
		mouseX < handle.x + xOffset &&
		mouseY > handle.y - yOffset &&
		mouseY < handle.y + yOffset
	);
};

const getHandlesHovered = (
	currentMousePosition: Point,
	polygon: Polygon,
	isTouchEvent: boolean = false
): HandlePosition => {
	const handlesArray = calculateRectangleHandles(polygon);
	const handleTypes: HandlePosition[] = ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w'];

	for (let i = 0; i < handlesArray.length; i++) {
		if (
			isWithinHandle(
				currentMousePosition.x,
				currentMousePosition.y,
				handlesArray[i],
				handleTypes[i],
				isTouchEvent
			)
		) {
			return handleTypes[i];
		}
	}

	return 'center';
};

const calculateVertices = (width: number, height: number, shrink: number = 5): LookupTable => {
	//tl corresponds to top left, tr to top right, etc.
	var vertices: LookupTable = {
		tl: { x: shrink, y: shrink },
		tr: { x: width - shrink, y: shrink },
		br: { x: width - shrink, y: height - shrink },
		bl: { x: shrink, y: height - shrink },
		mt: { x: width / 2, y: shrink },
		mr: { x: width - shrink, y: height / 2 },
		mb: { x: width / 2, y: height - shrink },
		ml: { x: shrink, y: height / 2 }
	};

	return vertices;
};

function pointToLineDistance(
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
	const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

	return numerator / denominator;
}

/**
 * Resize rectangle from corner
 *
 * @param x
 * @param y
 * @param polygon
 * @param resizeEdge
 */
const resizeRectangle = (x: number, y: number, polygon: Polygon, resizeEdge: string): Polygon => {
	//0:nw 1:ne 2:se 3:sw
	if (resizeEdge === 'n') {
		polygon.vertices[0].y = y;
		polygon.vertices[1].y = y;
	} else if (resizeEdge === 'e') {
		polygon.vertices[1].x = x;
		polygon.vertices[2].x = x;
	} else if (resizeEdge === 's') {
		polygon.vertices[2].y = y;
		polygon.vertices[3].y = y;
	} else if (resizeEdge === 'w') {
		polygon.vertices[3].x = x;
		polygon.vertices[0].x = x;
	} else if (resizeEdge === 'ne') {
		polygon.vertices[0].y = y;
		polygon.vertices[1].y = y;
		polygon.vertices[1].x = x;
		polygon.vertices[2].x = x;
	} else if (resizeEdge === 'se') {
		polygon.vertices[2].x = x;
		polygon.vertices[1].x = x;
		polygon.vertices[2].y = y;
		polygon.vertices[3].y = y;
	} else if (resizeEdge === 'sw') {
		polygon.vertices[3].x = x;
		polygon.vertices[0].x = x;
		polygon.vertices[2].y = y;
		polygon.vertices[3].y = y;
	} else if (resizeEdge === 'nw') {
		polygon.vertices[0].x = x;
		polygon.vertices[3].x = x;
		polygon.vertices[0].y = y;
		polygon.vertices[1].y = y;
	}
	return polygon;
};

function polygonArea(vertices: Point[]): number {
	let area = 0;

	// Calculate the sum of the products
	for (let i = 0; i < vertices.length - 1; i++) {
		area += vertices[i].x * vertices[i + 1].y - vertices[i + 1].x * vertices[i].y;
	}

	// Add the last term which is not included in the loop
	area +=
		vertices[vertices.length - 1].x * vertices[0].y -
		vertices[0].x * vertices[vertices.length - 1].y;

	// Divide by 2 and take the absolute value to get the area
	return Math.abs(area) / 2;
}

function scaleRectangle(polygon: Polygon, scaleFactor: number): Polygon {
	// Find the center of the rectangle
	const centerX = (polygon.vertices[0].x + polygon.vertices[2].x) / 2;
	const centerY = (polygon.vertices[0].y + polygon.vertices[2].y) / 2;

	// Create a new polygon where each vertex is scaled relative to the center
	const scaledPolygon: Polygon = {
		...polygon,
		vertices: polygon.vertices.map((vertex) => {
			const deltaX = vertex.x - centerX;
			const deltaY = vertex.y - centerY;

			return {
				x: centerX + deltaX * scaleFactor,
				y: centerY + deltaY * scaleFactor
			};
		})
	};

	return scaledPolygon;
}

function scaleArrow(arrow: Arrow, scaleFactor: number): Arrow {
	// Find the center of the arrow. For simplicity, we'll use the midpoint between start and end.
	const centerX = (arrow.startX + arrow.endX) / 2;
	const centerY = (arrow.startY + arrow.endY) / 2;

	const calculateScaledCoordinate = (
		originalX: number,
		originalY: number
	): { x: number; y: number } => {
		const deltaX = originalX - centerX;
		const deltaY = originalY - centerY;

		return {
			x: centerX + deltaX * scaleFactor,
			y: centerY + deltaY * scaleFactor
		};
	};

	const scaledStart = calculateScaledCoordinate(arrow.startX, arrow.startY);
	const scaledEnd = calculateScaledCoordinate(arrow.endX, arrow.endY);
	const scaledMid = calculateScaledCoordinate(arrow.midX, arrow.midY);

	return {
		startX: scaledStart.x,
		startY: scaledStart.y,
		endX: scaledEnd.x,
		endY: scaledEnd.y,
		midX: scaledMid.x,
		midY: scaledMid.y
	};
}

export {
	calculateVertices,
	pointToLineDistance,
	doLinesIntersect,
	calculateRectangleHandles,
	getHandlesHovered,
	isPointInPolygon,
	getContainingPolygon,
	isNearPoint,
	getCursorStyleFromDirection,
	generateHandleRectangles,
	resizeRectangle,
	scaleRectangle,
	polygonArea,
	scaleArrow
};
