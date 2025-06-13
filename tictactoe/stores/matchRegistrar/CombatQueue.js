import { Challenger } from './Challenger.js';

class CombatQueue {
    constructor() {
        if (!CombatQueue.instance) {
            this.pool = [];
            CombatQueue.instance = this;
        }
        return CombatQueue.instance;
    }

    addPlayer(entryData) {
        const entry = new Challenger(entryData);
        this.pool.push(entry);
        return entry;
    }

    removePlayer(playerId) {
        this.pool = this.pool.filter(entry => entry.playerId !== playerId);
    }

    findMatch(criteriaFn) {
        // criteriaFn: (entry, pool) => boolean
        return this.pool.find(entry => criteriaFn(entry, this.pool));
    }

    getAll() {
        return this.pool;
    }

    clear() {
        this.pool = [];
    }
}

const instance = new CombatQueue();
Object.freeze(instance);
export default instance;
