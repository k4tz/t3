import MatchmakingStrategy from './MatchmakingStrategy.ts';
import { calculateRank, RankTier } from '../../../utils/rank.ts';
import { getPlayerStats } from '../utils/player.ts';

/**
 * Rank-based matchmaking strategy that matches players based on their rank tier and stars
 * 
 * Matching Rules:
 * - Same tier: Can match with any player in the same tier (full star range)
 * - Adjacent tiers: Can match with players one tier above or below
 * - Cross-tier matching: Uses star-based scoring for compatibility
 */
class RankBasedStrategy extends MatchmakingStrategy {
    
    /**
     * Get player score based on rank tier and stars within tier
     * Higher tier = higher base score, stars within tier add to the score
     */
    getPlayerScore(player) {
        const stats = getPlayerStats(player.playerId);
        const rankInfo = calculateRank(stats.wins);
        
        // Base score by tier (higher tier = higher base score)
        const tierBaseScores = {
            'Unranked': 0,
            'Warrior': 1000,
            'Elite': 2000,
            'Master': 3000,
            'GrandMaster': 4000
        };
        
        const baseScore = tierBaseScores[rankInfo.tier];
        
        // Add stars within the tier (0-24 stars = 0-24 points)
        const starsInTier = this.getStarsInTier(stats.wins, rankInfo.tier);
        
        return baseScore + starsInTier;
    }
    
    /**
     * Check if two players can be matched based on rank compatibility
     */
    isCompatibleMatch(player1Score, player2Score, queueTimeFactor = 0) {
        const scoreDiff = Math.abs(player1Score - player2Score);
        
        // Same tier matching: Allow full range within tier (0-24 star difference)
        if (this.isSameTier(player1Score, player2Score)) {
            return scoreDiff <= 24; // Max stars in any tier
        }
        
        // Adjacent tier matching: Allow cross-tier matching with reasonable star difference
        if (this.isAdjacentTier(player1Score, player2Score)) {
            // For adjacent tiers, allow up to 50 stars difference across tiers
            // This accounts for the tier base score difference (1000 points) plus stars
            return scoreDiff <= 1050; // 1000 (tier diff) + 50 (max star diff)
        }
        
        // As queue time increases, become more lenient with matching
        if (queueTimeFactor > 0.5) { // After 2.5 minutes
            return scoreDiff <= 2000; // Very lenient matching across multiple tiers
        }
        
        return false; // Too far apart in rank
    }
    
    /**
     * Calculate match quality (higher = better match)
     * Prioritizes same-tier matches over cross-tier matches
     */
    getMatchQuality(player1Score, player2Score) {
        const scoreDiff = Math.abs(player1Score - player2Score);
        
        // Same tier matches are highest quality
        if (this.isSameTier(player1Score, player2Score)) {
            return 1.0 / (1 + scoreDiff); // Quality decreases with star difference
        }
        
        // Adjacent tier matches are medium quality
        if (this.isAdjacentTier(player1Score, player2Score)) {
            return 0.7 / (1 + scoreDiff); // Lower base quality for cross-tier
        }
        
        // Very lenient matches (long queue time) are lowest quality
        return 0.3 / (1 + scoreDiff);
    }
    
    /**
     * Helper method to get stars within current tier
     */
    private getStarsInTier(totalWins: number, tier: RankTier): number {
        switch (tier) {
            case 'Unranked':
                return 0;
            case 'Warrior':
                return totalWins - 1; // 1-25 wins = 0-24 stars
            case 'Elite':
                return totalWins - 26; // 26-50 wins = 0-24 stars
            case 'Master':
                return totalWins - 51; // 51-75 wins = 0-24 stars
            case 'GrandMaster':
                return totalWins - 76; // 76+ wins = 0+ stars
            default:
                return 0;
        }
    }
    
    /**
     * Check if two players are in the same tier
     */
    private isSameTier(score1: number, score2: number): boolean {
        const tier1 = this.getTierFromScore(score1);
        const tier2 = this.getTierFromScore(score2);
        return tier1 === tier2;
    }
    
    /**
     * Check if two players are in adjacent tiers
     */
    private isAdjacentTier(score1: number, score2: number): boolean {
        const tier1 = this.getTierFromScore(score1);
        const tier2 = this.getTierFromScore(score2);
        
        const tierOrder = ['Unranked', 'Warrior', 'Elite', 'Master', 'GrandMaster'];
        const tier1Index = tierOrder.indexOf(tier1);
        const tier2Index = tierOrder.indexOf(tier2);
        
        return Math.abs(tier1Index - tier2Index) === 1;
    }
    
    /**
     * Get tier from player score
     */
    private getTierFromScore(score: number): RankTier {
        if (score < 1000) return 'Unranked';
        if (score < 2000) return 'Warrior';
        if (score < 3000) return 'Elite';
        if (score < 4000) return 'Master';
        return 'GrandMaster';
    }
}

export default RankBasedStrategy;
