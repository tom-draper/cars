import Car from "./car";
import Intelligence from "./intelligence";

export default class Driver {
	#car: Car = new Car();
	#intelligence: Intelligence = new Intelligence();
	#memory: ActionHistory = new ActionHistory();
	#ability: DriverAbility;
	#state: DriverState;

	constructor() {
		this.#ability = DriverAbility.default();
		this.#state = DriverState.default();
	}

	get car() {
		return this.#car;
	}

	nextMove(drivers: Driver[]) {
		const { steer, accelerate, brake } = this.#intelligence.nextMove(this, drivers);
		this.car.steer(steer);
		this.car.accelerate(accelerate);
		this.car.brake(brake);
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
		const changed = this.car.accelerate(amount);
		this.#memory.add(ActionType.Acceleration, amount, changed);
	}

	brake(amount: number) {
		const changed = this.car.brake(amount);
		this.#memory.add(ActionType.Acceleration, -amount, -changed);
	}

	steer(amount: number) {
		const changed = this.car.steer(amount);
		this.#memory.add(ActionType.Steering, amount, changed);
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
	result: number;
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

	add(type: ActionType, value: number, result: number) {
		this.#history[this.#index] = { type, value, result };
		this.#increment();
	}

	#increment() {
		this.#index = (this.#index + 1) % this.#history.length;
	}

	getLastAction(n: number = 1): ActionHistoryEpoch | undefined {
		const size = this.#history.length;
        const lastIndex = (this.#index - n + size) % size;
        return this.#history[lastIndex];
    }
}
