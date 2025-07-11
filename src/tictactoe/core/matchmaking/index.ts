import CombatQueue from '../../stores/matchRegistrar/CombatQueue.ts';
import Colosseum from '../../stores/colosseum/Colosseum.ts';
import  MatchmakingService  from './MatchmakingService.ts';
import  WinLossStrategy  from './strategies/WinLossStrategy.ts';
import { Socket, Server } from 'socket.io';

let matchmakingService: MatchmakingService;

export default function setupMatchmaking(io: Server, socket: Socket) {
    // Initialize matchmaking service if not already done
    if (!matchmakingService) {
        matchmakingService = new MatchmakingService(new WinLossStrategy());
        matchmakingService.start();
    }

    // Join matchmaking pool
    socket.on("join_matchmaking", () => {
        if (socket.userId) {
            CombatQueue.addPlayer({ playerId: socket.userId, stars: 0, wins: 0, losses: 0 });
            socket.emit("matchmaking_status", "searching");
            console.log(`Player ${socket.userId} joined matchmaking pool`);
        } else {
            socket.emit("error", "Must be logged in to join matchmaking");
        }
    });

    // Leave matchmaking pool
    socket.on("leave_matchmaking", () => {
        CombatQueue.removePlayer(socket.userId);
        socket.emit("matchmaking_status", "cancelled");
        console.log(`Player ${socket.userId} left matchmaking pool`);
    });

    // Player makes a move
    socket.on("make_move", ({ arenaId, row, col }) => {
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
        Ledger.applyMove(playerMark, row, col);
        // Broadcast updated state to all in arena
        io.to(arenaId).emit("game_state_update", { Ledger });
    });

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
        // Remove player from any game arena
        for (const arena of Colosseum.getAllArena()) {
            if (arena.playerBelongsToArena(socket.userId)) {
                Colosseum.removeArena(arena.getArenaId());
                socket.to(arena.getArenaId()).emit("player_disconnected");
                break;
            }
        }
    });
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