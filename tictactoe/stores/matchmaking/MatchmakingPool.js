import { MatchmakingPoolEntry } from './MatchmakingPoolEntry.js';

class MatchmakingPool {
    constructor() {
        if (!MatchmakingPool.instance) {
            this.pool = [];
            MatchmakingPool.instance = this;
        }
        return MatchmakingPool.instance;
    }

    addPlayer(entryData) {
        const entry = new MatchmakingPoolEntry(entryData);
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

const instance = new MatchmakingPool();
Object.freeze(instance);
export default instance;
