import MatchmakingStrategy from './MatchmakingStrategy.js'

class RankBasedStrategy extends MatchmakingStrategy {
    getPlayerScore(player) {
        return player.rank; // Assuming rank is stored in player data
    }

    isCompatibleMatch(player1Score, player2Score) {
        const MAX_RANK_DIFF = 2;
        return Math.abs(player1Score - player2Score) <= MAX_RANK_DIFF;
    }

    getMatchQuality(player1Score, player2Score) {
        return 1 / (1 + Math.abs(player1Score - player2Score));
    }
}

export default RankBasedStrategy