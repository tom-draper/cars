import { CANVAS_DIMENSIONS } from "./consts";
import Driver from "./driver";
import Road from "./road";
import type { Vector } from "./vector";

let ctx: CanvasRenderingContext2D;
let enabled = true;
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
	if (!enabled) {
		return;
	}

	if (pointCount > 0 && pointCount % drivers.length === 0) {
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
	if (!enabled) {
		return;
	}

	if (lineCount > 0 && lineCount % drivers.length === 0) {
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
	ctx.clearRect(0, 0, CANVAS_DIMENSIONS.x, CANVAS_DIMENSIONS.y);
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

export function enableDebug() {
	enabled = true;
}

export function disableDebug() {
	enabled = false;
}