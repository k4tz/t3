import Arena from './Arena.ts';

let _instance: null | Colosseum = null;

class Colosseum {
    #colosseum = new Map<string, Arena>();
    constructor() {
        if (!_instance) {
            _instance = this;
        }
        return _instance;
    }

    createArena(arenaData) {
        const arena = new Arena(arenaData);
        this.#colosseum.set(arena.getArenaId(), arena);
        return arena;
    }

    removeArena(arenaId: string) {
        this.#colosseum.delete(arenaId);
    }

    getArena(arenaId: string) {
        return this.#colosseum.get(arenaId);
    }

    addSpectator(arenaId, spectator) {
        const arena = this.#colosseum.get(arenaId);
        if (arena) {
            arena.addSpectator(spectator);
        }
    }

    addPlayer(arenaId, player) {
        const arena = this.#colosseum.get(arenaId);
        if (arena) {
            arena.addPlayer(player);
        }
    }

    getAllArena() {
        return Array.from(this.#colosseum.values());
    }

    clear() {
        this.#colosseum.clear();
    }
}

const instance = new Colosseum();
export default instance;
