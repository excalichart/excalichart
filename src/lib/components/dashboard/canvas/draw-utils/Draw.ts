/**
 * Draw Rectangle edges.
 *
 * @param polygon
 * @param context
 * @param lineColor
 */
const drawRectangle = (
	vertices: Point[],
	context: CanvasRenderingContext2D,
	lineColor: string
): void => {
	context.beginPath();
	vertices.forEach((point, idx) => {
		if (idx === 0) {
			if (context) context.moveTo(point.x, point.y + 5);
		} else if (idx === 1) {
			if (context) context.lineTo(point.x - 5, point.y);
		} else if (idx === 2) {
			if (context) context.lineTo(point.x, point.y - 5);
		} else if (idx === 3) {
			if (context) context.lineTo(point.x + 5, point.y);
		} else {
			if (context) context.lineTo(point.x, point.y);
		}
	});
	context.closePath();
	context.strokeStyle = lineColor;
	context.stroke();
};

/**
 * Redraw when you move the polygon
 *
 * @param polygons
 * @param context
 * @param width
 * @param height
 * @param selectedPolygonIndex
 */

const redraw = (
	polygons: Polygon[],
	context: CanvasRenderingContext2D,
	windowWidth: number,
	windowHeight: number,
	selectedPolygonIndex: number | null
): void => {
	context.clearRect(0, 0, windowWidth, windowHeight);
	polygons.forEach((polygon, i) => {
		let lineColor = i === selectedPolygonIndex ? 'red' : 'black';
		drawRectangle(polygon.vertices, context, lineColor);
	});
};

/**
 * Maybe I should delete this function later
 *
 * @param polygon
 * @param context
 * @param color
 * @param radius
 */
const drawHandles = (
	vertices: Point[],
	context: CanvasRenderingContext2D,
	color: string,
	side: number
): void => {
	context.strokeStyle = color;
	context.lineWidth = 1;
	vertices.forEach((point) => {
		context.globalAlpha = 0.5; // sets transparency to 50%
		context.beginPath();
		context.rect(point.x - side / 2, point.y - side / 2, side, side);
		context.stroke();
		context.globalAlpha = 1.0; // reset the transparency to the original state
	});
};

/**
 * DrawEraserTrail
 *
 * @param mouseTrail
 * @param context
 * @param lineColor
 * @param lineWidth   // <-- Add this parameter
 * @returns void
 */
const drawEraserTrail = (
	mouseTrail: Point[],
	context: CanvasRenderingContext2D,
	lineColor: string,
	lineWidth: number = 5 // <-- Set a default width of 5, you can adjust this value as needed
): void => {
	if (mouseTrail.length < 2) return;
	context.lineWidth = lineWidth; // <-- Set the line width here
	context.beginPath();
	context.strokeStyle = lineColor;
	for (let i = 1; i < mouseTrail.length; i++) {
		context.moveTo(mouseTrail[i - 1].x, mouseTrail[i - 1].y);
		context.lineTo(mouseTrail[i].x, mouseTrail[i].y);
		context.stroke();
	}
};
const drawArrow = (
	roughCanvas: any,
	strokeWidth: number,
	roughness: number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	scale: number = 1
) => {
	const angle = Math.atan2(endY - startY, endX - startX);
	const arrowheadLength = 15; // The length of the arrowhead lines
	const headAngle = Math.PI / 7; // Angle for the arrowhead.

	const x1 = endX - arrowheadLength * Math.cos(angle - headAngle);
	const y1 = endY - arrowheadLength * Math.sin(angle - headAngle);
	const x2 = endX - arrowheadLength * Math.cos(angle + headAngle);
	const y2 = endY - arrowheadLength * Math.sin(angle + headAngle);

	roughCanvas.line(startX, startY, endX, endY, {
		stroke: 'white',
		strokeWidth: strokeWidth * scale * 1,
		roughness: 0
	});

	roughCanvas.path(`M ${endX} ${endY} L ${x1} ${y1} M ${endX} ${endY} L ${x2} ${y2}`, {
		stroke: 'white',
		strokeWidth: strokeWidth,
		roughness: roughness
	});
};

const getPlotTopPosition = (polygon: Polygon): number => {
	return Math.min(polygon.vertices[0].y, polygon.vertices[2].y);
};

const getPlotLeftPosition = (polygon: Polygon): number => {
	return Math.abs(polygon.vertices[0].x - polygon.vertices[2].x);
};

export {
	drawArrow,
	drawRectangle,
	drawEraserTrail,
	redraw,
	drawHandles,
	getPlotTopPosition,
	getPlotLeftPosition
};
