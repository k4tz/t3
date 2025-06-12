import { GameArena } from './GameArena.js';

class GameArenaPool {
    constructor() {
        if (!GameArenaPool.instance) {
            this.arena = new Map();
            GameArenaPool.instance = this;
        }
        return GameArenaPool.instance;
    }

    createArena(arenaData) {
        const arena = new GameArena(arenaData);
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

const instance = new GameArenaPool();
Object.freeze(instance);
export default instance;
