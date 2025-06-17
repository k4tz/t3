export class Challenger {
    constructor({ playerId, stars = 0, ...playerData } = {}) {
        this.playerId = playerId;
        this.stars = stars;
        this.queueStartTime = Date.now();
        this.queueTime = 0;
        this.matchmakingPreferences = playerData.matchmakingPreferences || {};
    }

    updateQueueTime() {
        this.queueTime = Date.now() - this.queueStartTime;
        return this.queueTime;
    }

    getQueueTimeInSeconds() {
        return Math.floor(this.queueTime / 1000);
    }
}
