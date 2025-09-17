import CombatQueue from '../../stores/matchRegistrar/CombatQueue.ts';
import Colosseum from '../../stores/colosseum/Colosseum.ts';
import ConnectionStore from '../../stores/connection/ConnectionStore.ts';
import  MatchmakingService  from './MatchmakingService.ts';
import  WinLossStrategy  from './strategies/WinLossStrategy.ts';
import { Socket, Server } from 'socket.io';

let matchmakingService: MatchmakingService | null = null;
const disconnectTimeouts = new Map<string, NodeJS.Timeout>();

export default function setupMatchmaking(io: Server, socket: Socket) {
    
    // Initialize matchmaking service if not already done
    if (!matchmakingService) {
        matchmakingService = new MatchmakingService(new WinLossStrategy(), io);
        matchmakingService.start();
    }

    // Join matchmaking pool
    socket.on("join_matchmaking", () => {
        if (socket.userId) {
            const poolBefore = CombatQueue.getPool().length;
            CombatQueue.addPlayer({ playerId: socket.userId, stars: 0, wins: 0, losses: 0 });
            const poolAfter = CombatQueue.getPool().length;
            socket.emit("matchmaking_status", "searching");
            console.log(`[Matchmaking] Player ${socket.userId} joined matchmaking pool (pool size: ${poolBefore} -> ${poolAfter})`);
        } else {
            socket.emit("error", "Must be logged in to join matchmaking");
            console.log(`[Matchmaking] Anonymous user attempted to join matchmaking`);
        }
    });

    // Leave matchmaking pool
    socket.on("leave_matchmaking", () => {
        if (socket.userId) {
            const poolBefore = CombatQueue.getPool().length;
            CombatQueue.removePlayer(socket.userId);
            const poolAfter = CombatQueue.getPool().length;
            socket.emit("matchmaking_status", "cancelled");
            console.log(`[Matchmaking] Player ${socket.userId} left matchmaking pool (pool size: ${poolBefore} -> ${poolAfter})`);
        }
    });

    // Player makes a move
    socket.on("make_move", ({ arenaId, row, col }) => {
        if (!socket.userId) {
            socket.emit("error", "Must be logged in to make moves");
            return;
        }
        
        const arena = Colosseum.getArena(arenaId);
        if (!arena) {
            socket.emit("error", "Arena not found");
            return;
        }
        // Determine player's mark (X or O) based on position in arena.players
        const playerIdx = arena.getPlayerIndex(socket.userId);
        if (playerIdx === -1) {
            socket.emit("error", "Not a player in this arena");
            return;
        }
        const playerMark = playerIdx === 0 ? 'X' : 'O';
        const Ledger = arena.getLedger();
        if (!Ledger.isValidMove(playerMark, row, col)) {
            socket.emit("invalid_move", { message: "Invalid move" });
            return;
        }
        const moveResult = Ledger.applyMove(playerMark, row, col);
        
        // Broadcast updated state to all in arena
        const winnerUsername = arena.getWinnerUsername();
        io.to(arenaId).emit("game_state_update", { 
            Ledger: {
                board: Ledger.board,
                currentPlayer: Ledger.currentPlayer,
                winner: winnerUsername
            }
        });
        
        // Check if game is over and end the match
        if (winnerUsername) {
            console.log(`[Matchmaking] Game ended in arena ${arenaId} - Winner: ${winnerUsername}`);
            arena.endMatch('victory');
        }
    });

    // Handle player surrender
    socket.on("surrender", (data: { arenaId: string }) => {
        
        if (!socket.userId) {
            socket.emit("error", "Must be logged in to surrender");
            return;
        }
        const arena = Colosseum.getArena(data.arenaId);
        
        if (!arena) {
            console.error(`[Matchmaking] Arena ${data.arenaId} not found for surrender`);
            socket.emit("error", "Arena not found");
            return;
        }
        
        if (!arena.playerBelongsToArena(socket.userId)) {
            console.error(`[Matchmaking] Player ${socket.userId} is not in arena ${data.arenaId}`);
            socket.emit("error", "You are not a player in this arena");
            return;
        }
        
        // Get the opponent
        const players = arena.getPlayers();
        const opponentId = players.find(playerId => playerId !== socket.userId);
        
        if (opponentId) {
            // Notify opponent that player surrendered
            const opponentConnection = ConnectionStore.getConnection(opponentId);
            
            if (opponentConnection) {
                const opponentSocket = opponentConnection.getSocket();
                if (opponentSocket) {
                    opponentSocket.emit("opponent_surrendered", { 
                        message: "Your opponent has surrendered. You win!" 
                    });
                } else {
                    console.error(`[Matchmaking] Opponent socket not found for ${opponentId}`);
                }
            } else {
                console.error(`[Matchmaking] No connection found for opponent ${opponentId}`);
            }
        } else {
            console.error(`[Matchmaking] No opponent found in arena ${data.arenaId}`);
        }
        
        // End the match with surrender reason
        arena.endMatch('surrender');
        
        // Notify the surrendering player
        socket.emit("surrender_success", { message: "You have surrendered the match" });
    });

    // Note: join_arena event handler removed - players are automatically added to arena during matchmaking

    // Join as spectator
    socket.on("join_as_spectator", (arenaId) => {
        const arena = Colosseum.getArena(arenaId);
        if (arena) {
            socket.join(arenaId);
            Colosseum.addSpectator(arenaId, socket.id);
            socket.emit("spectator_joined", arenaId);
            console.log(`Spectator joined arena ${arenaId}`);
        } else {
            socket.emit("error", "Game arena not found");
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        CombatQueue.removePlayer(socket.id);
        // Don't immediately remove arena - give time for reconnection
        if (socket.userId) {
            for (const arena of Colosseum.getAllArena()) {
                if (arena.playerBelongsToArena(socket.userId)) {
                    const arenaId = arena.getArenaId();
                    const players = arena.getPlayers();
                    
                    // Notify other players that this player disconnected
                    socket.to(arenaId).emit("player_disconnected", {
                        disconnectedPlayer: socket.userId,
                        message: "Your opponent has disconnected. Waiting for reconnection..."
                    });
                    
                    // Set a timeout to remove the arena if no reconnection occurs
                    const timeoutId = setTimeout(() => {
                        const currentArena = Colosseum.getArena(arenaId);
                        if (currentArena && currentArena.playerBelongsToArena(socket.userId)) {
                            // Check if the disconnected player has reconnected
                            const connectionStore = require("../stores/connection/ConnectionStore.ts").default;
                            const currentConnection = connectionStore.getConnection(socket.userId);
                            
                            if (!currentConnection || !currentConnection.getSocket().connected) {
                                // Player hasn't reconnected, end the match
                                currentArena.endMatch('disconnect');
                                socket.to(arenaId).emit("game_ended", {
                                    reason: "opponent_disconnected",
                                    message: "Your opponent failed to reconnect. Game ended."
                                });
                            }
                        }
                        // Clean up timeout reference
                        disconnectTimeouts.delete(socket.userId);
                    }, 30000); // 30 second grace period for reconnection
                    
                    // Store timeout reference for cleanup
                    disconnectTimeouts.set(socket.userId, timeoutId);
                    break;
                }
            }
        }
    });
}

// Export function to get matchmaking service for cleanup
export function getMatchmakingService(): MatchmakingService | null {
    return matchmakingService;
}

// Export function to cleanup all timeouts
export function cleanupTimeouts(): void {
    console.log(`[Matchmaking] Cleaning up ${disconnectTimeouts.size} disconnect timeouts`);
    disconnectTimeouts.forEach((timeout, userId) => {
        clearTimeout(timeout);
    });
    disconnectTimeouts.clear();
}

// function findMatch(socket) {
//     const pool = CombatQueue.getPool();
//     if (pool.length < 2) return;

//     // Get the current player
//     const currentPlayer = pool.find(p => p.getPlayerId() === socket.userId);
//     if (!currentPlayer) return;

//     // Use rank-based matchmaking
//     const matchmakingService = new MatchmakingService(new WinLossStrategy());
    
//     // Or use Elo-based matchmaking
//     // const matchmakingService = new MatchmakingService(new EloStrategy());
    
//     // Find best match
//     const bestMatch = matchmakingService.findBestMatch(currentPlayer, pool);
//     if (!bestMatch) return;

//     // Create a unique arena ID
//     const arenaId = `game_${Date.now()}`;

//     // Remove players from matchmaking pool
//     CombatQueue.removePlayer(currentPlayer.playerId);
//     CombatQueue.removePlayer(bestMatch.playerId);

//     // Create a new game arena
//     const arena = new Arena({
//         arenaId,
//         players: [currentPlayer.playerId, bestMatch.playerId],
//         spectators: []
//     });
//     Colosseum.createArena(arena);

//     // Find sockets by userId
//     const sockets = Array.from(io.sockets.sockets.values());
//     const player1Socket = sockets.find(s => s.userId === currentPlayer.playerId);
//     const player2Socket = sockets.find(s => s.userId === bestMatch.playerId);

//     // Join both players to the arena
//     if (player1Socket) player1Socket.join(arenaId);
//     if (player2Socket) player2Socket.join(arenaId);

//     // Notify both players
//     if (player1Socket) player1Socket.emit("match_found", { arenaId, opponent: bestMatch.playerId });
//     if (player2Socket) player2Socket.emit("match_found", { arenaId, opponent: currentPlayer.playerId });

//     console.log(`Match created in arena ${arenaId} between ${currentPlayer.playerId} and ${bestMatch.playerId}`);
// }