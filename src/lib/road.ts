import { bezierPoint } from "./bezier";
import { addVectors, multiplyVectorByScalar, subtractVectors, type Vector } from "./vector";

export class Road {
	static #nextCarID = 0;

	#id: number = Road.#nextID();
	#start: Vector;
	#end: Vector;
	#control1: Vector | null;
	#control2: Vector | null;

	constructor(start: Vector, end: Vector, control1: Vector | null = null, control2: Vector | null = null) {
		this.#start = start;
		this.#end = end;
		this.#control1 = control1;
		this.#control2 = control2;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.moveTo(this.#start.x, this.#start.y);
		if (this.#control1 !== null && this.#control2 !== null) {
			ctx.bezierCurveTo(this.#control1.x, this.#control1.y, this.#control2.x, this.#control2.y, this.#end.x, this.#end.y);
		} else {
			ctx.lineTo(this.#end.x, this.#end.y);
		}
		ctx.stroke();
	}

	pointOnRoad(t: number) {
		if (this.#control1 !== null && this.#control2 !== null) {
			return bezierPoint(t, this.#start, this.#end, this.#control1, this.#control2)
		} else {
			const AB = subtractVectors(this.#end, this.#start);
			return addVectors(this.#start, multiplyVectorByScalar(AB, t));
		}
	}

	get id() {
		return this.#id;
	}

	get start() {
		return this.#start;
	}

	get end() {
		return this.#end;
	}

	get control1() {
		return this.#control1;
	}

	get control2() {
		return this.#control2;
	}

	isBezier(): this is { control1: Vector; control2: Vector } {
		return this.#control1 !== null && this.#control2 !== null;
	}

	static #nextID() {
		return Road.#nextCarID++;
	}
}