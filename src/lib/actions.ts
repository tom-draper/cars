export enum ActionType {
	Acceleration,
	Steering
}

export type ActionHistoryEpoch = {
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

	get size() {
		return this.#history.length;
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

