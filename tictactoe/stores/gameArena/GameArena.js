export class GameArena {
    constructor({ roomId, players = [], spectators = [], ...extra } = {}) {
        this.roomId = roomId;
        this.players = players;
        this.spectators = spectators;
        Object.assign(this, extra);
    }
}
