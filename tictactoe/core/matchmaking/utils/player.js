import CombatQueue from "../../../stores/matchRegistrar/CombatQueue.js"

export function getPlayerStats(playerId) {
    const entry = CombatQueue.getAll().find(e => e.playerId === playerId);
    if (entry) {
        return { wins: entry.wins, losses: entry.losses };
    }
    return { wins: 0, losses: 0 };
}