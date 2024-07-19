import { Car } from "./car";

export class Driver {
    #ability: DriverAbility;
    #state: DriverState;

    car: Car = new Car();
    #history: DriverHistory = new DriverHistory();

    constructor() {
        this.#ability = DriverAbility.default();
        this.#state = DriverState.default();
    }

    nextMove() {
        // Combine driver ability and state with history (and road layout in 
        // future) to calculate next move
        this.randomSteer();
        this.randomAccelerate();
        this.car.update();
    }

    randomSteer() {
        const p = Math.random();
        if (p > 0.3) {
            this.car.steer(Math.random() - 0.5);
        }
    }

    randomAccelerate() {
        const p = Math.random();
        if (p > 0.8) {
            this.car.accelerate(1);
        } else if (p < 0.01) {
            this.car.brake(1);
        }
    }

    accelerate(amount: number) {
        this.car.accelerate(amount);
        this.#history.add(DriverHistoryType.Acceleration, amount);
    }

    brake(amount: number) {
        this.car.brake(amount);
        this.#history.add(DriverHistoryType.Acceleration, -amount);
    }

    steer(amount: number) {
        this.car.steer(amount);
        this.#history.add(DriverHistoryType.Steering, amount);
    }

    static default() {
        return new Driver();
    }
}

export class DriverAbility {
    #steering: number;
    #speed: number;

    constructor(steering: number, speed: number) {
        this.#steering = steering;
        this.#speed = speed;
    }

    static default() {
        return new DriverAbility(0.5, 0.5);
    }
}

export class DriverState {
    #intoxication: number;
    #tiredness: number;
    #eyesight: number

    constructor(intoxication: number, tiredness: number, eyesight: number) {
        this.#intoxication = intoxication;
        this.#tiredness = tiredness;
        this.#eyesight = eyesight;
    }

    static default() {
        return new DriverState(0, 0, 1);
    }
}

enum DriverHistoryType{
    Acceleration,
    Steering
}

type DriverHistoryEpoch = {
    type: DriverHistoryType;
    value: number
}

class DriverHistory {
    #history: DriverHistoryEpoch[];
    #index: number = 0;

    constructor(size: number = 50) {
        if (size <= 0) {
            throw new Error("Size must be greater than 0");
        }

        this.#history = new Array(size);
    }

    add(type: DriverHistoryType, value: number) {
        this.#history[this.#index] = { type, value };
        this.#increment();
    }

    #increment() {
        this.#index = (this.#index + 1) % this.#history.length;
    }
}
