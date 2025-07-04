import  Challenger  from './Challenger.js';

let _instance: CombatQueue | null = null;

class CombatQueue {
    #pool: Challenger[] = [];
    constructor() {
        if (!_instance) {
            _instance = this;
        }
        return _instance;
    }

    addPlayer(entryData) {
        const entry = new Challenger(entryData);
        this.#pool.push(entry);
        return entry;
    }

    removePlayer(playerId) {
        this.#pool = this.#pool.filter(entry => entry.playerId !== playerId);
    }

    findMatch(criteriaFn: CallableFunction) {
        // criteriaFn: (entry, #pool) => boolean
        return this.#pool.find(entry => criteriaFn(entry, this.#pool));
    }

    getAll() {
        return this.#pool;
    }

    clear() {
        this.#pool = [];
    }
}

const instance = new CombatQueue();
export default instance;
