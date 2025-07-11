import CombatQueue from "../../../stores/matchRegistrar/CombatQueue.ts"

export function getPlayerStats(playerId: string) {
    const entry = CombatQueue.getPool().find(e => e.getPlayerId() === playerId);
    if (entry) {
        return { wins: entry.getWins(), losses: entry.getLosses() };
    }
    return { wins: 0, losses: 0 };
}