import type { Driver } from "./driver";
import type { Road } from "./road";
import type { Vector } from "./vector";


export default class Debug {
    static #ctx: CanvasRenderingContext2D;
    static #roads: Road[];
    static #drivers: Driver[];
    static #pointCount: number = 0;
    static #lineCount: number = 0;
    static #color: string = 'red';

    public static init(ctx: CanvasRenderingContext2D, roads: Road[], drivers: Driver[]) {
        Debug.#ctx = ctx;
        Debug.#roads = roads;
        Debug.#drivers = drivers;
    }
    
    public static displayPoint(point: Vector) {
        if (Debug.#pointCount % Debug.#drivers.length === 0) {
            Debug.#clearCanvas();
            Debug.#pointCount = 0;
        }
        Debug.#ctx.strokeStyle = Debug.#color;
        Debug.#ctx.beginPath();
        Debug.#ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI, true);
        Debug.#ctx.stroke();
        Debug.#ctx.strokeStyle = "black";
        Debug.#pointCount++;
    }
    
    public static displayLine(start: Vector, end: Vector) {
        if (Debug.#lineCount % Debug.#drivers.length === 0) {
            // Debug.#clearCanvas();
            // Debug.#lineCount = 0;
        }
        Debug.#ctx.strokeStyle = Debug.#color;
        Debug.#ctx.beginPath();
        Debug.#ctx.moveTo(start.x, start.y);
        Debug.#ctx.lineTo(end.x, end.y);
        Debug.#ctx.stroke();
        Debug.#ctx.strokeStyle = "black";
        Debug.#lineCount++;
    }
    
    static #clearCanvas() {
        Debug.#ctx.clearRect(0, 0, 800, 800);
        Debug.redrawRoads();
    }
    
    static redrawRoads() {
        for (const road of Debug.#roads) {
            road.draw(Debug.#ctx);
        }
    }

    static set color(color: string) {
        Debug.#color = color;
    }
}