export default class Identifiable {
    static #nextIds = new Map();

    #id: number;

    constructor() {
        const className = this.constructor.name;
        if (!Identifiable.#nextIds.has(className)) {
            Identifiable.#nextIds.set(className, 1);
        }
        this.#id = Identifiable.#nextIds.get(className);
        Identifiable.#nextIds.set(className, this.#id + 1);
    }

    get id() {
        return this.#id;
    }
}