import { GameState } from './GameState.js';

export class GameArena {
    constructor({ arenaId, players = [], spectators = [], ...extra } = {}) {
        this.arenaId = arenaId;
        this.players = players;
        this.spectators = spectators;
        this.gameState = new GameState();
        Object.assign(this, extra);
    }
}
