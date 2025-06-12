

import MatchmakingPool from '../stores/matchmaking/MatchmakingPool.js';
import { MatchmakingPoolEntry } from '../stores/matchmaking/MatchmakingPoolEntry.js';
import GameArenaPool from '../stores/gameArena/GameArenaPool.js';
import { GameArena } from '../stores/gameArena/GameArena.js';

import { GameState } from '../stores/gameArena/GameState.js';

export default function setupMatchmaking(socket) {
    // Join matchmaking pool
    socket.on("join_matchmaking", (playerData = {}) => {
        if (socket.userID) {
            const entry = new MatchmakingPoolEntry({ playerId: socket.userID, ...playerData });
            MatchmakingPool.addPlayer(entry);
            socket.emit("matchmaking_status", "searching");
            console.log(`Player ${socket.userID} joined matchmaking pool`);
            // Try to find a match
            findMatch(socket);
        } else {
            socket.emit("error", "Must be logged in to join matchmaking");
        }
    });

    // Leave matchmaking pool
    socket.on("leave_matchmaking", () => {
        MatchmakingPool.removePlayer(socket.userID);
        socket.emit("matchmaking_status", "cancelled");
        console.log(`Player ${socket.userID} left matchmaking pool`);
    });

    // Player makes a move
    socket.on("make_move", ({ arenaId, row, col }) => {
        const arena = GameArenaPool.getArena(arenaId);
        if (!arena) {
            socket.emit("error", "Arena not found");
            return;
        }
        // Determine player's mark (X or O) based on position in arena.players
        const playerIdx = arena.players.indexOf(socket.userID);
        if (playerIdx === -1) {
            socket.emit("error", "Not a player in this arena");
            return;
        }
        const playerMark = playerIdx === 0 ? 'X' : 'O';
        const gameState = arena.gameState;
        if (!gameState.isValidMove(playerMark, row, col)) {
            socket.emit("invalid_move", { message: "Invalid move" });
            return;
        }
        gameState.applyMove(playerMark, row, col);
        // Broadcast updated state to all in arena
        socket.server.to(arenaId).emit("game_state_update", { gameState });
    });

    // Join as spectator
    socket.on("join_as_spectator", (arenaId) => {
        const arena = GameArenaPool.getArena(arenaId);
        if (arena) {
            socket.join(arenaId);
            GameArenaPool.addSpectator(arenaId, socket.id);
            socket.emit("spectator_joined", arenaId);
            console.log(`Spectator joined arena ${arenaId}`);
        } else {
            socket.emit("error", "Game arena not found");
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        MatchmakingPool.removePlayer(socket.id);
        // Remove player from any game arena
        for (const arena of GameArenaPool.getAllarena()) {
            if (arena.players.includes(socket.userID)) {
                GameArenaPool.removeArena(arena.arenaId);
                socket.to(arena.arenaId).emit("player_disconnected");
                break;
            }
        }
    });
}


function getPlayerStats(playerId) {
    const entry = MatchmakingPool.getAll().find(e => e.playerId === playerId);
    if (entry) {
        return { wins: entry.wins, losses: entry.losses };
    }
    return { wins: 0, losses: 0 };
}

function findMatch(socket) {
    const pool = MatchmakingPool.getAll();
    if (pool.length >= 2) {
        let bestPair = null;
        let minDiff = Infinity;
        
        for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
                const stats1 = getPlayerStats(pool[i].playerId);
                const stats2 = getPlayerStats(pool[j].playerId);
                // Use win-loss difference for matchmaking
                const diff = Math.abs((stats1.wins - stats1.losses) - (stats2.wins - stats2.losses));
                if (diff < minDiff) {
                    minDiff = diff;
                    bestPair = [pool[i], pool[j]];
                }
            }
        }
        if (!bestPair) return;
        const [player1, player2] = bestPair;

        // Create a unique arena ID
        const arenaId = `game_${Date.now()}`;

        // Remove players from matchmaking pool
        MatchmakingPool.removePlayer(player1.playerId);
        MatchmakingPool.removePlayer(player2.playerId);

        // Create a new game arena (arena) with extensible data
        const arena = new GameArena({
            arenaId,
            players: [player1.playerId, player2.playerId], // These are userIDs now
            spectators: []
        });
        GameArenaPool.createArena(arena);

        // Find sockets by userID
        const sockets = Array.from(socket.server.sockets.sockets.values());
        const player1Socket = sockets.find(s => s.userID === player1.playerId);
        const player2Socket = sockets.find(s => s.userID === player2.playerId);

        // Join both players to the arena (if connected)
        if (player1Socket) player1Socket.join(arenaId);
        if (player2Socket) player2Socket.join(arenaId);

        // Notify both players
        if (player1Socket) player1Socket.emit("match_found", { arenaId, opponent: player2.playerId });
        if (player2Socket) player2Socket.emit("match_found", { arenaId, opponent: player1.playerId });

        console.log(`Match created in arena ${arenaId} between ${player1.playerId} and ${player2.playerId}`);
    }
}