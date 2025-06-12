export class MatchmakingPoolEntry {
    constructor({ playerId, wins = 0, losses = 0, ...extra } = {}) {
        this.playerId = playerId;
        this.wins = wins;
        this.losses = losses;
        Object.assign(this, extra);
    }
}
