
export class Driver {
    #skill: number;
    #intoxication: number;
    #eyesight: number;

    constructor(skill: number, intoxication: number, eyesight: number) {
        this.#skill = skill;
        this.#intoxication = intoxication;
        this.#eyesight = eyesight;
    }

    static default() {
        return new Driver(0.5, 0.5, 0.5);
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
