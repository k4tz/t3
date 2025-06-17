import MatchmakingStrategy from './MatchmakingStrategy.js'

class EloStrategy extends MatchmakingStrategy {
    getPlayerScore(player) {
        return player.elo; // Assuming elo is stored in player data
    }

    isCompatibleMatch(player1Score, player2Score) {
        const MAX_ELO_DIFF = 200;
        return Math.abs(player1Score - player2Score) <= MAX_ELO_DIFF;
    }

    getMatchQuality(player1Score, player2Score) {
        return 1 / (1 + Math.abs(player1Score - player2Score) / 100);
    }
}

export default EloStrategy