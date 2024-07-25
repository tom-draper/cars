import type { Vector } from "./vector";

export class Road {
    #start: Vector;
    #end: Vector;
    constructor(start: Vector, end: Vector) {
        this.#start = start;
        this.#end = end;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.#start.x, this.#start.y);
        ctx.lineTo(this.#end.x, this.#end.y);
        ctx.stroke();
    }

    get start() {
        return this.#start;
    }

    get end() {
        return this.#end;
    }

    get direction() {
        return {
            x: this.#end.x - this.#start.x,
            y: this.#end.y - this.#start.y
        };
    }
}