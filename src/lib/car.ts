import type { Vector } from "./vector";
import type { Road } from "./road";

export class Car {
    #velocity = 0;
    #direction = 0;
    #position: Vector = { x: 0, y: 0 };
    #road: Road | null = null;
    #performance: CarPerformance;
    #element: HTMLDivElement | null = null;

    static #distanceUnit = 1;
    static #steerUnit = 1;
    static #drag = 0.1;

    constructor(performance: CarPerformance = CarPerformance.default()) {
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
        this.#position = this.#sumVectors(this.#position, movement);
        this.#updateCarElement();
    }

    #updateCarElement() {
        if (this.#element) {
            // Apply the rotation and translation
            this.#element.style.transform = Car.#translationStyle(this.#direction, this.#position);
        }
    }

    static #translationStyle(direction: number, position: Vector) {
        return `translate(${position.x}px, ${position.y}px) rotate(${direction}rad)`;
    }

    #translationVector(): Vector {
        const translateX = this.#velocity * Math.cos(this.#direction);
        const translateY = this.#velocity * Math.sin(this.#direction);
        return { x: translateX, y: translateY };
    }

    #sumVectors(a: Vector, b: Vector): Vector {
        return { x: a.x + b.x, y: a.y + b.y };
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
