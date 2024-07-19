import { Car } from "./car";

export class Driver {
    #ability: DriverAbility;
    #state: DriverState;

    #car: Car = new Car();
    #history: ActionHistory = new ActionHistory();

    constructor() {
        this.#ability = DriverAbility.default();
        this.#state = DriverState.default();
    }

    get car() {
        return this.#car;
    }

    nextMove() {
        // Decide next move based on: 
        // - Current velocity
        // - Road layout
        // - Action history
        // - Ability
        // - State
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
        if (this.car.velocity > 1) {
            this.car.brake(0.3);
        } else {
            this.car.accelerate(1);
        }
    }

    accelerate(amount: number) {
        this.car.accelerate(amount);
        this.#history.add(ActionType.Acceleration, amount);
    }

    brake(amount: number) {
        this.car.brake(amount);
        this.#history.add(ActionType.Acceleration, -amount);
    }

    steer(amount: number) {
        this.car.steer(amount);
        this.#history.add(ActionType.Steering, amount);
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
    #eyesight: number;

    constructor(intoxication: number, tiredness: number, eyesight: number) {
        this.#intoxication = intoxication;
        this.#tiredness = tiredness;
        this.#eyesight = eyesight;
    }

    static default() {
        return new DriverState(0, 0, 1);
    }
}

enum ActionType {
    Acceleration,
    Steering
}

type ActionHistoryEpoch = {
    type: ActionType;
    value: number;
}

class ActionHistory {
    #history: ActionHistoryEpoch[];
    #index: number = 0;

    constructor(size: number = 50) {
        if (size <= 0) {
            throw new Error("Size must be greater than 0");
        }

        this.#history = new Array(size);
    }

    add(type: ActionType, value: number) {
        this.#history[this.#index] = { type, value };
        this.#increment();
    }

    #increment() {
        this.#index = (this.#index + 1) % this.#history.length;
    }
}
