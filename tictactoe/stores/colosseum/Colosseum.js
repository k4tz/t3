import Arena from './Arena.js';

class Colosseum {
    #arena = null;
    constructor() {
        if (!Colosseum.instance) {
            this.arena = new Map();
            Colosseum.instance = this;
        }
        return Colosseum.instance;
    }

    createArena(arenaData) {
        const arena = new Arena(arenaData);
        this.arena.set(arena.arenaId, arena);
        return arena;
    }

    removeArena(arenaId) {
        this.arena.delete(arenaId);
    }

    getArena(arenaId) {
        return this.arena.get(arenaId);
    }

    addSpectator(arenaId, spectator) {
        const arena = this.arena.get(arenaId);
        if (arena) {
            arena.spectators.push(spectator);
        }
    }

    addPlayer(arenaId, player) {
        const arena = this.arena.get(arenaId);
        if (arena) {
            arena.players.push(player);
        }
    }

    getAllarena() {
        return Array.from(this.arena.values());
    }

    clear() {
        this.arena.clear();
    }
}

const instance = new Colosseum();
export default instance;
