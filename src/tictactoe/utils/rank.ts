/**
 * @description: Rank system utilities for the T3 game
 * 
 * Rank Tiers:
 * - Unranked: 0 wins
 * - Warrior: 1-25 wins
 * - Elite: 26-50 wins  
 * - Master: 51-75 wins
 * - GrandMaster: 76+ wins
 */

export type RankTier = 'Unranked' | 'Warrior' | 'Elite' | 'Master' | 'GrandMaster';

export interface RankInfo {
    tier: RankTier;
    wins: number;
    displayText: string;
    progress: number; // Progress within current tier (0-100)
}

/**
 * Calculate rank information based on number of wins
 */
export function calculateRank(wins: number): RankInfo {
    let tier: RankTier;
    let progress: number;
    
    if (wins === 0) {
        tier = 'Unranked';
        progress = 0;
    } else if (wins >= 1 && wins <= 25) {
        tier = 'Warrior';
        progress = ((wins - 1) / 24) * 100; // 0-24 wins = 0-100% progress
    } else if (wins >= 26 && wins <= 50) {
        tier = 'Elite';
        progress = ((wins - 26) / 24) * 100; // 26-50 wins = 0-100% progress
    } else if (wins >= 51 && wins <= 75) {
        tier = 'Master';
        progress = ((wins - 51) / 24) * 100; // 51-75 wins = 0-100% progress
    } else {
        tier = 'GrandMaster';
        progress = 100; // GrandMaster is the highest tier
    }
    
    return {
        tier,
        wins,
        displayText: `${tier} ${wins}*`,
        progress: Math.round(progress)
    };
}

/**
 * Get the next tier information
 */
export function getNextTier(currentWins: number): { tier: RankTier; winsNeeded: number } | null {
    if (currentWins < 1) {
        return { tier: 'Warrior', winsNeeded: 1 };
    } else if (currentWins < 26) {
        return { tier: 'Elite', winsNeeded: 26 - currentWins };
    } else if (currentWins < 51) {
        return { tier: 'Master', winsNeeded: 51 - currentWins };
    } else if (currentWins < 76) {
        return { tier: 'GrandMaster', winsNeeded: 76 - currentWins };
    } else {
        return null; // Already at highest tier
    }
}

/**
 * Get rank tier color for UI
 */
export function getRankColor(tier: RankTier): string {
    switch (tier) {
        case 'Unranked':
            return '#6B7280'; // Gray
        case 'Warrior':
            return '#EF4444'; // Red
        case 'Elite':
            return '#3B82F6'; // Blue
        case 'Master':
            return '#8B5CF6'; // Purple
        case 'GrandMaster':
            return '#F59E0B'; // Gold
        default:
            return '#6B7280';
    }
}
