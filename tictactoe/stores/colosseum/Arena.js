import { Ledger } from './Ledger.js';

export class Arena {
    constructor({ arenaId, players = [], spectators = [] } = {}) {
        this.arenaId = arenaId;
        this.players = players;
        this.spectators = spectators;
        this.Ledger = new Ledger();
    }
}
