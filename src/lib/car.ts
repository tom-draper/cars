
type Vector = {
    x: number;
    y: number;
}

export class Car {
    #velocity = 0;
    #direction = 0;
    #position: Vector = { x: 0, y: 0 };
    #performance: CarPerformance;
    #element: HTMLDivElement | null = null;

    static #distanceUnit = 1;
    static #steerUnit = 0.1;
    static #drag = 0.1;

    constructor(performance: CarPerformance = CarPerformance.default()) {
        this.#performance = performance;
    }

    attach(element: HTMLDivElement) {
        if (element instanceof HTMLDivElement) {
            this.#element = element;
        }
    }
    
    accelerate(amount: number) {
        const increment = amount * this.#performance.acceleration * Car.#distanceUnit;
        this.#velocity += increment;
    }

    brake(amount: number) {
        if (this.#velocity <= 0) {
            return;
        }

        // Limit the maximum decrement to avoid velocity below 0
        const decrement = Math.min(amount * this.#performance.braking * Car.#distanceUnit, this.#velocity);
        this.#velocity -= decrement;
    }

    steer(amount: number) {
        const change = amount * Car.#steerUnit;
        this.#direction += change;
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
