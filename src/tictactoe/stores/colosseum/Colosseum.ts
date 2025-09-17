import Arena from './Arena.ts';

class Colosseum {
    private colosseum = new Map<string, Arena>();
    private static instance: Colosseum | null = null;

    private constructor() {}

    static getInstance(): Colosseum {
        if (!Colosseum.instance) {
            Colosseum.instance = new Colosseum();
        }
        return Colosseum.instance;
    }

    createArena(arenaData) {
        const arena = new Arena(arenaData);
        this.colosseum.set(arena.getArenaId(), arena);
        return arena;
    }

    removeArena(arenaId: string) {
        this.colosseum.delete(arenaId);
    }

    getArena(arenaId: string) {
        return this.colosseum.get(arenaId);
    }

    addSpectator(arenaId: string, spectatorId: string) {
        const arena = this.colosseum.get(arenaId);
        if (arena) {
            arena.addSpectator(spectatorId);
        }
    }

    addPlayer(arenaId: string, playerId: string) {
        const arena = this.colosseum.get(arenaId);
        if (arena) {
            arena.addPlayer(playerId);
        }
    }

    getAllArena() {
        return Array.from(this.colosseum.values());
    }

    clear() {
        this.colosseum.clear();
    }
}

export default Colosseum.getInstance();
