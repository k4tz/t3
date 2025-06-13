export class Challenger {
    constructor({ playerId, wins = 0, losses = 0 } = {}) {
        this.playerId = playerId;
        this.wins = wins;
        this.losses = losses;
    }
}
