export default class Challenger {
    #playerId: string;
    #stars: number;
    #queueStartTime: number;
    #queueTime: number;
    #wins: number;
    #losses: number;
    
    constructor({ playerId, stars = 0, wins = 0, losses = 0 }: ChallengerData) {
        this.#playerId = playerId;
        this.#stars = stars > 0 ? stars : 0;
        this.#queueStartTime = Date.now();
        this.#queueTime = 0;
        this.#wins = wins;
        this.#losses = losses;
    }

    getPlayerId() {
        return this.#playerId;
    }

    getStars() {
        return this.#stars;
    }

    getWins() {
        return this.#wins;
    }

    getLosses() {
        return this.#losses;
    }

    updateQueueTime() {
        this.#queueTime = Date.now() - this.#queueStartTime;
        return this.#queueTime;
    }

    getQueueTimeInSeconds() {
        return Math.floor(this.#queueTime / 1000);
    }
}

export interface ChallengerData {
    playerId: string;
    stars: number;
    wins: number;
    losses: number;
}
