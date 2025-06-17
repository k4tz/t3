export class MatchmakingStrategy {
    getPlayerScore(player) {
        throw new Error('getPlayerScore must be implemented');
    }

    isCompatibleMatch(player1Score, player2Score, queueTimeFactor) {
        throw new Error('isCompatibleMatch must be implemented');
    }

    getMatchQuality(player1Score, player2Score, queueTimeFactor) {
        throw new Error('getMatchQuality must be implemented');
    }
}