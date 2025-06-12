

import MatchmakingPool from '../stores/matchmaking/MatchmakingPool.js';
import { MatchmakingPoolEntry } from '../stores/matchmaking/MatchmakingPoolEntry.js';
import GameArenaPool from '../stores/gameArena/GameArenaPool.js';
import { GameArena } from '../stores/gameArena/GameArena.js';

export default function setupMatchmaking(socket) {
    // Join matchmaking pool
    socket.on("join_matchmaking", (playerData = {}) => {
        if (socket.userID) {
            // Prepare extensible entry data
            const entryData = { playerId: socket.id, ...playerData };
            MatchmakingPool.addPlayer(entryData);
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
        MatchmakingPool.removePlayer(socket.id);
        socket.emit("matchmaking_status", "cancelled");
        console.log(`Player ${socket.userID} left matchmaking pool`);
    });

    // Join as spectator
    socket.on("join_as_spectator", (roomId) => {
        const room = GameArenaPool.getRoom(roomId);
        if (room) {
            socket.join(roomId);
            GameArenaPool.addSpectator(roomId, socket.id);
            socket.emit("spectator_joined", roomId);
            console.log(`Spectator joined room ${roomId}`);
        } else {
            socket.emit("error", "Game room not found");
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        MatchmakingPool.removePlayer(socket.id);
        // Remove player from any game room
        for (const room of GameArenaPool.getAllarena()) {
            if (room.players.includes(socket.id)) {
                GameArenaPool.removeRoom(room.roomId);
                socket.to(room.roomId).emit("player_disconnected");
                break;
            }
        }
    });
}


function findMatch(socket) {
    const pool = MatchmakingPool.getAll();
    if (pool.length >= 2) {
        // For extensibility, match by any logic (e.g. closest win/loss ratio)
        // For now, just take the first two
        const [player1, player2] = pool.slice(0, 2);

        // Create a unique room ID
        const roomId = `game_${Date.now()}`;

        // Remove players from matchmaking pool
        MatchmakingPool.removePlayer(player1.playerId);
        MatchmakingPool.removePlayer(player2.playerId);

        // Create a new game arena (room) with extensible data
        GameArenaPool.createRoom({
            roomId,
            players: [player1.playerId, player2.playerId],
            spectators: []
        });

        // Get the other player's socket
        const otherPlayerSocket = socket.server.sockets.sockets.get(player2.playerId);

        // Join both players to the room
        socket.join(roomId);
        otherPlayerSocket.join(roomId);

        // Notify both players
        socket.emit("match_found", { roomId, opponent: otherPlayerSocket.userID });
        otherPlayerSocket.emit("match_found", { roomId, opponent: socket.userID });

        console.log(`Match created in room ${roomId} between ${socket.userID} and ${otherPlayerSocket.userID}`);
    }
}