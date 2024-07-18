import { Driver } from "./driver";

type Vector = {
    x: number;
    y: number;
}

export class Car {
    #velocity = 0;
    #direction = 0;
    #position: Vector = { x: 0, y: 0 };
    #performance: CarPerformance;
    #driver: Driver;
    #element: HTMLDivElement | null = null;

    static #distanceUnit = 0.1;
    static #steerUnit = 0.1;

    constructor(performance: CarPerformance = CarPerformance.default(), driver: Driver = Driver.default()) {
        this.#performance = performance;
        this.#driver = driver;
    }

    attach(element: HTMLDivElement) {
        if (element instanceof HTMLDivElement) {
            this.#element = element;
        }
    }
    
    accelerate() {
        this.#velocity += this.#performance.acceleration * Car.#distanceUnit;
    }

    brake() {
        this.#velocity -= this.#performance.braking * Car.#distanceUnit;
        this.#velocity = Math.max(0, this.#velocity);
    }

    steer(radians: number) {
        this.#direction += radians * Car.#steerUnit;
        if (this.#element) {
            this.#element.style.transform = Car.#translationStyle(this.#direction, this.#position);
        }
    }

    move() {
        if (!this.#element) {
            return
        }

        // Calculate the translation vector
        const movement = this.#translationVector();
        const position = this.#sumVectors(this.#position, movement);
        this.#position = position;

        // Apply the rotation and translation
        this.#element.style.transform = Car.#translationStyle(this.#direction, position);
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
    #braking: number;
    #speed: number;

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

