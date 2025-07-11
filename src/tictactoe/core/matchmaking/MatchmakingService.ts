import CombatQueue from '../../stores/matchRegistrar/CombatQueue.ts';
import Colosseum from '../../stores/colosseum/Colosseum.ts';
import Arena from '../../stores/colosseum/Arena.ts';
import WinLossStrategy from './strategies/WinLossStrategy.ts';
import ConnectionStore from '../../stores/connection/ConnectionStore.ts';

export default class MatchmakingService {
    #strategy: WinLossStrategy;
    #isRunning: boolean;
    #matchmakingInterval: number;
    
    constructor(strategy: WinLossStrategy) {
        this.#strategy = strategy;
        this.#isRunning = false;
        this.#matchmakingInterval = 5000;
    }

    start() {
        if (this.#isRunning) return;
        this.#isRunning = true;
        this.runMatchmaking();
    }

    stop() {
        this.#isRunning = false;
    }

    async runMatchmaking() {
        while (this.#isRunning) {
            await this.processMatchmaking();
            await new Promise(resolve => setTimeout(resolve, this.#matchmakingInterval));
        }
    }

    async processMatchmaking() {
        const pool = CombatQueue.getPool();
        if (pool.length < 2) return;

        // Update queue times for all players
        pool.forEach(player => player.updateQueueTime());

        // Sort players by queue time (longest waiting first)
        const sortedPool = [...pool].sort((a, b) => b.getQueueTimeInSeconds() - a.getQueueTimeInSeconds());

        for (const player of sortedPool) {
            // Skip if player is already matched
            if (!CombatQueue.hasPlayer(player.getPlayerId())) continue;

            const bestMatch = this.findBestMatch(player, pool);
            if (bestMatch) {
                await this.createMatch(player, bestMatch);
            }
        }
    }

    findBestMatch(currentPlayer, pool) {
        const currentScore = this.#strategy.getPlayerScore(currentPlayer);
        let bestMatch = null;
        let bestQuality = -1;

        for (const player of pool) {
            if (player.playerId === currentPlayer.playerId) continue;
            if (!CombatQueue.hasPlayer(player.playerId)) continue;

            const playerScore = this.#strategy.getPlayerScore(player);
            const queueTimeFactor = this.calculateQueueTimeFactor(currentPlayer, player);
            
            if (this.#strategy.isCompatibleMatch(currentScore, playerScore)) {
                const quality = this.#strategy.getMatchQuality(currentScore, playerScore);
                if (quality > bestQuality) {
                    bestQuality = quality;
                    bestMatch = player;
                }
            }
        }

        return bestMatch;
    }

    calculateQueueTimeFactor(player1, player2) {
        const maxQueueTime = 300000; // 5 minutes in milliseconds
        const avgQueueTime = (player1.queueTime + player2.queueTime) / 2;
        return Math.min(avgQueueTime / maxQueueTime, 1);
    }

    async createMatch(player1, player2) {
        const arenaId = `game_${Date.now()}`;

        // Remove players from matchmaking pool
        CombatQueue.removePlayer(player1.playerId);
        CombatQueue.removePlayer(player2.playerId);

        // Create a new game arena
        const arena = new Arena({
            arenaId,
            players: [player1.playerId, player2.playerId],
            spectators: []
        });
        Colosseum.createArena(arena);

        // Find sockets by userId
        const player1Socket = ConnectionStore.getConnection(player1.playerId).getSocket();
        const player2Socket = ConnectionStore.getConnection(player2.playerId).getSocket();

        // Join both players to the arena
        if (player1Socket) player1Socket.join(arenaId);
        if (player2Socket) player2Socket.join(arenaId);

        // Notify both players
        if (player1Socket) player1Socket.emit("match_found", { 
            arenaId, 
            opponent: player2.playerId,
            queueTime: player1.getQueueTimeInSeconds()
        });
        if (player2Socket) player2Socket.emit("match_found", { 
            arenaId, 
            opponent: player1.playerId,
            queueTime: player2.getQueueTimeInSeconds()
        });

        console.log(`Match created in arena ${arenaId} between ${player1.playerId} and ${player2.playerId}`);
    }
}