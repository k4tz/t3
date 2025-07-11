import  Challenger, { ChallengerData }  from './Challenger.ts';

let _instance: CombatQueue | null = null;

class CombatQueue {
    #pool: Challenger[] = [];
    constructor() {
        if (!_instance) {
            _instance = this;
        }
        return _instance;
    }

    addPlayer(entryData: ChallengerData) {
        const entry = new Challenger(entryData);
        this.#pool.push(entry);
        return entry;
    }

    removePlayer(playerId: string) {
        this.#pool = this.#pool.filter(entry => entry.getPlayerId() !== playerId);
    }

    findMatch(criteriaFn: CallableFunction) {
        // criteriaFn: (entry, #pool) => boolean
        return this.#pool.find(entry => criteriaFn(entry, this.#pool));
    }

    hasPlayer(playerId: string) {
        return this.#pool.some(entry => entry.getPlayerId() === playerId);
    }

    getPool(){
        return this.#pool;
    }
}

const instance = new CombatQueue();
export default instance;
