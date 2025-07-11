import Ledger from './Ledger.ts';
import Challenger from '../matchRegistrar/Challenger.ts';

export interface ArenaData {
    arenaId: string;
    players: [Challenger, Challenger];
    spectators: Challenger[];
}

export default class Arena {
    #arenaId: string;
    #players: [Challenger, Challenger];
    #spectators: Challenger[];
    #Ledger: Ledger;
    constructor({ arenaId, players, spectators = []}: ArenaData) {
        this.#arenaId = arenaId;
        this.#players = players;
        this.#spectators = spectators;
        this.#Ledger = new Ledger();
    }

    getArenaId() {
        return this.#arenaId;
    }

    getPlayers() {
        return this.#players;
    }

    getSpectators() {
        return this.#spectators;
    }

    getLedger() {
        return this.#Ledger;
    }

    addPlayer(player){
        this.#players.push(player);
    }

    addSpectator(spectator) {
        this.#spectators.push(spectator);
    }

    playerBelongsToArena(playerId: string) {
        return this.#players.some(player => player.getPlayerId() === playerId);
    }

    getPlayerIndex(playerId: string) {
        return this.#players.findIndex(player => player.getPlayerId() === playerId);
    }
}
