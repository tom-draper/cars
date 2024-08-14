import Car from "./car";
import { ActionHistory, ActionType } from "./actions";
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

	get memory() {
		return this.#memory;
	}

	nextMove(drivers: Driver[]) {
		const { steer, accelerate, brake } = this.#intelligence.nextMove(this, drivers);
		this.steer(steer);
		this.accelerate(accelerate);
		this.brake(brake);
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
