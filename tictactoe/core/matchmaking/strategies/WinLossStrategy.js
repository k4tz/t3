import MatchmakingStrategy from './MatchmakingStrategy.js'
import { getPlayerStats } from '../utils/player.js'

class WinLossStrategy extends MatchmakingStrategy {
    getPlayerScore(player) {
        const stats = getPlayerStats(player.playerId);
        return stats.wins - stats.losses;
    }

    isCompatibleMatch(player1Score, player2Score) {
        const MAX_DIFF = 5;
        return Math.abs(player1Score - player2Score) <= MAX_DIFF;
    }

    getMatchQuality(player1Score, player2Score) {
        return 1 / (1 + Math.abs(player1Score - player2Score));
    }
}

export default WinLossStrategy