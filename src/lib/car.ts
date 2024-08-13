import { addVectors, distanceSquared, type Vector } from "./vector";
import type Road from "./road";
import Intelligence from "./intelligence";

export default class Car extends Identifiable {
	static #distanceUnit = 1;
	static #steerUnit = 1;
	static #drag = 0.1;
	static #colors = ["white", "black", "gray", "silver", "brown", "orange", "beige", "gold", "red", "blue", "green", "yellow", "purple"];

	#color: string = Car.randomColor();
	#velocity = 0;
	#direction = 0;
	#position: Vector = { x: 0, y: 0 };
	#road: Road | null = null;
	#performance: CarPerformance;
	#element: HTMLDivElement | null = null;

	constructor(performance: CarPerformance = CarPerformance.default()) {
		super();
		this.#performance = performance;
	}

	get velocity() {
		return this.#velocity;
	}

	get position() {
		return this.#position;
	}

	get direction() {
		return this.#direction;
	}

	get directionVector() {
		return { x: Math.cos(this.#direction), y: Math.sin(this.#direction) };
	}

	get road() {
		return this.#road;
	}

	set road(road: Road | null) {
		this.#road = road;
	}

	attach(element: HTMLDivElement) {
		if (element instanceof HTMLDivElement) {
			element.id = `car-${this.id}`;
			element.style.background = this.#color;
			element.classList.add("car");
			this.#element = element;
		}
	}

	accelerate(amount: number): number {
		const increment = amount * this.#performance.acceleration * Car.#distanceUnit;
		this.#velocity += increment;
		return increment;
	}

	brake(amount: number): number {
		if (this.#velocity <= 0) {
			return 0;
		}

		// Limit the maximum decrement to avoid velocity below 0
		const decrement = Math.min(amount * this.#performance.braking * Car.#distanceUnit, this.#velocity);
		this.#velocity -= decrement;
		return decrement;
	}

	steer(amount: number): number {
		const change = amount * Car.#steerUnit;
		this.#direction += change;
		return change;
	}

	update() {
		// Apply drag to slow down the car
		this.#velocity -= Math.min(Car.#drag, this.#velocity);

		// Calculate new position based on current velocity and direction
		const movement = this.#translationVector();
		this.#position = addVectors(this.#position, movement);
		this.#updateCarElement();
	}

	setRoad(roads: Road[]) {
		const road = this.#nearestRoad(roads);
		const oldRoadID = this.#road === null ? 'null' : this.#road.id;
		const newRoadID = road === null ? 'null' : road.id;
		this.#road = road;
		if (oldRoadID !== newRoadID) {
			console.log(`Car ${this.id} changed road from ${oldRoadID} to ${newRoadID}`)
		}
	}

	#nearestRoad(roads: Road[]) {
		const best: { road: Road | null, distance: number } = {
			road: null,
			distance: Infinity,
		};
		for (const road of roads) {
			for (let t = 0; t <= 1; t += Intelligence.stepSize) {
				const pointOnRoad = road.pointOnRoad(t);
				const distance = distanceSquared(pointOnRoad, this.#position);
				if (distance < best.distance) {
					best.road = road;
					best.distance = distance;
				}
			}
		}
		return best.road;
	}

	#updateCarElement() {
		if (this.#element) {
			// Apply the rotation and translation
			this.#element.style.transform = Car.#translationStyle(this.#direction, this.#position);
		}
	}

	distanceTo(position: Vector) {
		const dx = this.#position.x - position.x;
		const dy = this.#position.y - position.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	static randomColor() {
		return Car.#colors[Math.floor(Math.random() * Car.#colors.length)];
	}

	static #translationStyle(direction: number, position: Vector) {
		return `translate(${position.x}px, ${position.y}px) rotate(${direction}rad)`;
	}

	#translationVector(): Vector {
		const translateX = this.#velocity * Math.cos(this.#direction);
		const translateY = this.#velocity * Math.sin(this.#direction);
		return { x: translateX, y: translateY };
	}
}

export class CarPerformance {
	#acceleration: number;
	#speed: number;
	#braking: number;

	constructor(braking: number, acceleration: number, speed: number) {
		this.#acceleration = acceleration;
		this.#speed = speed;
		this.#braking = braking;
	}

	get acceleration() {
		return this.#acceleration;
	}

	get braking() {
		return this.#braking;
	}

	get speed() {
		return this.#speed;
	}

	static default() {
		return new CarPerformance(0.5, 0.5, 0.5);
	}
}
