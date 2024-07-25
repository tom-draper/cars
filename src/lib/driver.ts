import { Car } from "./car";
import { Intelligence } from "./intelligence";

export class Driver {
    #car: Car = new Car();
    #intelligence: Intelligence = new Intelligence();
    #history: ActionHistory = new ActionHistory();
    #ability: DriverAbility;
    #state: DriverState;

    constructor() {
        this.#ability = DriverAbility.default();
        this.#state = DriverState.default();
    }

    get car() {
        return this.#car;
    }

    nextMove() {
        const { steer, accelerate } = this.#intelligence.nextMove(this);
        this.car.steer(steer);
        this.car.accelerate(accelerate);
        // this.randomSteer();
        // this.randomAccelerate();
        this.car.update();
    }

    // randomSteer() {
    //     const p = Math.random();
    //     if (p > .3) {
    //         const amount = Math.random() - 0.5 - 0.5;
    //         console.log(amount);
    //         this.car.steer(amount * .1);
    //     }
    // }

    // randomAccelerate() {
    //     if (this.car.velocity > 0.5) {
    //         this.car.brake(.3);
    //     } else {
    //         this.car.accelerate(.5);
    //     }
    // }

    accelerate(amount: number) {
        const accelerated = this.car.accelerate(amount);
        this.#history.add(ActionType.Acceleration, accelerated);
    }

    brake(amount: number) {
        const decelerated = this.car.brake(amount);
        this.#history.add(ActionType.Acceleration, -decelerated);
    }

    steer(amount: number) {
        const changed = this.car.steer(amount);
        this.#history.add(ActionType.Steering, changed);
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

export class ActionHistory {
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
