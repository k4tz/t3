// Store for players in matchmaking pool
const matchmakingPool = new Set();

// Store for active game rooms
const gameRooms = new Map();

export default function matchmakingRT(socket) {
    // Join matchmaking pool
    socket.on("join_matchmaking", () => {
        if (socket.userID) {
            matchmakingPool.add(socket.id);
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
        matchmakingPool.delete(socket.id);
        socket.emit("matchmaking_status", "cancelled");
        console.log(`Player ${socket.userID} left matchmaking pool`);
    });

    // Join as spectator
    socket.on("join_as_spectator", (roomId) => {
        if (gameRooms.has(roomId)) {
            socket.join(roomId);
            socket.emit("spectator_joined", roomId);
            console.log(`Spectator joined room ${roomId}`);
        } else {
            socket.emit("error", "Game room not found");
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        matchmakingPool.delete(socket.id);
        // Remove from game room if in one
        for (const [roomId, players] of gameRooms.entries()) {
            if (players.includes(socket.id)) {
                gameRooms.delete(roomId);
                socket.to(roomId).emit("player_disconnected");
                break;
            }
        }
    });
}

function findMatch(socket) {
    if (matchmakingPool.size >= 2) {
        // Get two players from the pool
        const players = Array.from(matchmakingPool).slice(0, 2);
        
        // Create a unique room ID
        const roomId = `game_${Date.now()}`;
        
        // Remove players from matchmaking pool
        players.forEach(playerId => matchmakingPool.delete(playerId));
        
        // Store room information
        gameRooms.set(roomId, players);
        
        // Get the other player's socket
        const otherPlayerSocket = socket.server.sockets.sockets.get(players[1]);
        
        // Join both players to the room
        socket.join(roomId);
        otherPlayerSocket.join(roomId);
        
        // Notify both players
        socket.emit("match_found", { roomId, opponent: otherPlayerSocket.userID });
        otherPlayerSocket.emit("match_found", { roomId, opponent: socket.userID });
        
        console.log(`Match created in room ${roomId} between ${socket.userID} and ${otherPlayerSocket.userID}`);
    }
}