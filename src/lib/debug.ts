import type { Driver } from "./driver";
import type { Road } from "./road";
import type { Vector } from "./vector";

let ctx: CanvasRenderingContext2D;
let roads: Road[];
let drivers: Driver[];
let pointCount: number = 0;
let lineCount: number = 0;
let color: string = 'red';

export function init(_ctx: CanvasRenderingContext2D, _roads: Road[], _drivers: Driver[]) {
	ctx = _ctx;
	roads = _roads;
	drivers = _drivers;
}

export function displayPoint(point: Vector) {
	if (pointCount % drivers.length === 0) {
		clearCanvas();
	}
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI, true);
	ctx.stroke();
	ctx.strokeStyle = "black";
	pointCount++;
}

export function displayLine(start: Vector, end: Vector) {
	if (lineCount % drivers.length === 0) {
		clearCanvas();
	}
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.stroke();
	ctx.strokeStyle = "black";
	lineCount++;
}

function clearCanvas() {
	ctx.clearRect(0, 0, 800, 800);
	redrawRoads();
	lineCount = 0;
	pointCount = 0;
}

function redrawRoads() {
	for (const road of roads) {
		road.draw(ctx);
	}
}

export function setColor(_color: string) {
	color = _color;
}