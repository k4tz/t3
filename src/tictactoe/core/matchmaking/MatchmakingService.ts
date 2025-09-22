import CombatQueue from '../../stores/matchRegistrar/CombatQueue.ts';
import Colosseum from '../../stores/colosseum/Colosseum.ts';
import Arena from '../../stores/colosseum/Arena.ts';
import RankBasedStrategy from './strategies/RankBasedStrategy.ts';
import ConnectionStore from '../../stores/connection/ConnectionStore.ts';
import appConfig from '../../../config/app.ts';
import { Server } from 'socket.io';

export default class MatchmakingService {
    #strategy: RankBasedStrategy;
    #isRunning: boolean;
    #matchmakingInterval: number;
    #intervalId: NodeJS.Timeout | null;
    #io: Server | undefined; // Socket.IO Server instance
    
    constructor(strategy: RankBasedStrategy, io?: Server) {
        this.#strategy = strategy;
        this.#isRunning = false;
        this.#matchmakingInterval = 5000;
        this.#intervalId = null;
        this.#io = io;
    }

    start() {
        if (this.#isRunning) return;
        this.#isRunning = true;
        this.runMatchmaking();
    }

    stop() {
        this.#isRunning = false;
        if (this.#intervalId) {
            clearTimeout(this.#intervalId);
            this.#intervalId = null;
        }
    }

    async runMatchmaking() {
        if (!this.#isRunning) return;
        
        await this.processMatchmaking();
        
        if (this.#isRunning) {
            this.#intervalId = setTimeout(() => {
                this.runMatchmaking();
            }, this.#matchmakingInterval);
        }
    }

    async processMatchmaking() {
        const pool = CombatQueue.getPool();
        console.log(`[Matchmaking] Processing pool with ${pool.length} players`);
        
        if (pool.length < 2) {
            console.log(`[Matchmaking] Not enough players in pool (${pool.length} < 2)`);
            return;
        }

        // Update queue times for all players
        pool.forEach(player => player.updateQueueTime());

        // Sort players by queue time (longest waiting first)
        const sortedPool = [...pool].sort((a, b) => b.getQueueTimeInSeconds() - a.getQueueTimeInSeconds());
        console.log(`[Matchmaking] Sorted pool:`, sortedPool.map(p => ({ id: p.getPlayerId(), queueTime: p.getQueueTimeInSeconds() })));

        for (const player of sortedPool) {
            // Skip if player is already matched
            if (!CombatQueue.hasPlayer(player.getPlayerId())) {
                console.log(`[Matchmaking] Player ${player.getPlayerId()} no longer in pool, skipping`);
                continue;
            }

            console.log(`[Matchmaking] Looking for match for player ${player.getPlayerId()}`);
            const bestMatch = this.findBestMatch(player, pool);
            if (bestMatch) {
                console.log(`[Matchmaking] Found match: ${player.getPlayerId()} vs ${bestMatch.getPlayerId()}`);
                await this.createMatch(player, bestMatch);
            } else {
                console.log(`[Matchmaking] No suitable match found for player ${player.getPlayerId()}`);
            }
        }
    }

    findBestMatch(currentPlayer, pool) {
        const currentScore = this.#strategy.getPlayerScore(currentPlayer);
        console.log(`[Matchmaking] Player ${currentPlayer.getPlayerId()} has score: ${currentScore}`);
        let bestMatch = null;
        let bestQuality = -1;

        for (const player of pool) {
            if (player.getPlayerId() === currentPlayer.getPlayerId()) continue;
            if (!CombatQueue.hasPlayer(player.getPlayerId())) continue;

            const playerScore = this.#strategy.getPlayerScore(player);
            console.log(`[Matchmaking] Checking compatibility with ${player.getPlayerId()} (score: ${playerScore})`);
            
            if (this.#strategy.isCompatibleMatch(currentScore, playerScore)) {
                const quality = this.#strategy.getMatchQuality(currentScore, playerScore);
                console.log(`[Matchmaking] Compatible match found with quality: ${quality}`);
                if (quality > bestQuality) {
                    bestQuality = quality;
                    bestMatch = player;
                }
            } else {
                console.log(`[Matchmaking] Not compatible (score diff: ${Math.abs(currentScore - playerScore)})`);
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
        CombatQueue.removePlayer(player1.getPlayerId());
        CombatQueue.removePlayer(player2.getPlayerId());
        
        // Send updated queue size to all remaining players
        const remainingQueueSize = CombatQueue.getPool().length;
        if (this.#io) {
            this.#io.emit("queue_size_update", { 
                queueSize: remainingQueueSize,
                isLowQueue: remainingQueueSize <= 2 
            });
        }

        // Create a new game arena
        const player1Id = player1.getPlayerId();
        const player2Id = player2.getPlayerId();
        
        if (!player1Id || !player2Id) {
            console.error(`[Matchmaking] Invalid player IDs: player1=${player1Id}, player2=${player2Id}`);
            return;
        }

        // Find sockets by userId
        const player1Connection = ConnectionStore.getConnection(player1.getPlayerId());
        const player2Connection = ConnectionStore.getConnection(player2.getPlayerId());
        
        if (!player1Connection) {
            console.error(`[Matchmaking] No connection found for player ${player1.getPlayerId()}`);
            return;
        }
        if (!player2Connection) {
            console.error(`[Matchmaking] No connection found for player ${player2.getPlayerId()}`);
            return;
        }

        const player1Socket = player1Connection.getSocket();
        const player2Socket = player2Connection.getSocket();

        // Join both players to the arena
        if (player1Socket) {
            player1Socket.join(arenaId);
        }
        if (player2Socket) {
            player2Socket.join(arenaId);
        }

        // Get usernames for display
        const player1Username = player1Connection.getUserData().username;
        const player2Username = player2Connection.getUserData().username;

        // Create arena with usernames and timer configuration
        const arenaData = {
            arenaId,
            players: [player1Id, player2Id] as [string, string],
            spectators: [],
            playerUsernames: [player1Username, player2Username] as [string, string],
            matchStartTime: new Date(),
            autoCloseTimer: appConfig.matchAutoCloseTimer
        };
        const arena = new Arena(arenaData);
        
        Colosseum.createArena(arena);

        // Notify both players with their assigned marks
        if (player1Socket) {
            player1Socket.emit("match_found", { 
                arenaId, 
                opponent: player2Username,
                opponentId: player2.getPlayerId(),
                queueTime: player1.getQueueTimeInSeconds(),
                playerMark: 'X' // Player 1 is always X
            });
            // Send player mark immediately
            player1Socket.emit("player_mark", 'X');
            console.log(`[Matchmaking] Sent match_found to ${player1Username} (vs ${player2Username}) as X`);
        }
        if (player2Socket) {
            player2Socket.emit("match_found", { 
                arenaId, 
                opponent: player1Username,
                opponentId: player1.getPlayerId(),
                queueTime: player2.getQueueTimeInSeconds(),
                playerMark: 'O' // Player 2 is always O
            });
            // Send player mark immediately
            player2Socket.emit("player_mark", 'O');
            console.log(`[Matchmaking] Sent match_found to ${player2Username} (vs ${player1Username}) as O`);
        }

        // Send initial game state to both players to start the game
        const ledger = arena.getLedger();
        const winnerUsername = arena.getWinnerUsername();
        
        // Broadcast initial game state to arena if io instance is available
        if (this.#io) {
            this.#io.to(arenaId).emit("game_state_update", { 
                Ledger: {
                    board: ledger.board,
                    currentPlayer: ledger.currentPlayer,
                    winner: winnerUsername
                }
            });
            
            console.log(`[Matchmaking] Sent initial game state to arena ${arenaId} - Current player: ${ledger.currentPlayer}`);
        } else {
            console.warn(`[Matchmaking] No io instance available to send initial game state to arena ${arenaId}`);
        }

    }

}