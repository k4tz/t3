import connectionStore from "../stores/connection/ConnectionStore.ts";
import ConnectionData, { UserConnectionData } from "../stores/connection/ConnectionData.ts";
import User from "../../db/models/User.ts";
import { Socket } from "socket.io";
import Colosseum from "../stores/colosseum/Colosseum.ts";

export default function connectionManager(socket: Socket) {
    socket.on("authenticate", (data: {userId: string}) => {
        //check if a previous connection exists and if it does, we properly remove and disconnect it
        let previousConnection = connectionStore.getConnection(data.userId)
        if(previousConnection){
            previousConnection.getSocket().disconnect();
        }

        //get the user for the id
        User.findById(data.userId).then(user => {
            if(!user){
                socket.emit("authenticate_error", "User not found");
                return;
            }
            const connectionData = new ConnectionData({id: user._id.toString(), username: user.username}, socket);

            connectionStore.setConnection(data.userId, connectionData);
            socket.userId = data.userId;
            
            // Check if user was in an active game and restore state
            checkAndRestoreGameState(socket, data.userId);
        }).catch(err => {
            console.log(err);
            socket.emit("authenticate_error", "Something went wrong");
        });
    });

    socket.on("leave_presence_channel", () => {
        if(!socket.userId) return;
        connectionStore.removeConnection(socket.userId);
        socket.userId = undefined;
    });

    socket.on("disconnect", () => {
        if(socket.userId){
            connectionStore.removeConnection(socket.userId);
            socket.userId = undefined;
        }
    });
}

function checkAndRestoreGameState(socket: Socket, userId: string) {
    // Check if user was in an active game
    const arenas = Colosseum.getAllArena();
    const activeArena = arenas.find(arena => arena.playerBelongsToArena(userId));
    
    if (activeArena) {
        const arenaId = activeArena.getArenaId();
        const players = activeArena.getPlayers();
        const ledger = activeArena.getLedger();
        
        // Join the socket to the arena room
        socket.join(arenaId);
        
        // Send game state restoration data
        const winnerUsername = activeArena.getWinnerUsername();
        socket.emit("game_state_restore", {
            arenaId,
            players,
            gameState: {
                board: ledger.board,
                currentPlayer: ledger.currentPlayer,
                winner: winnerUsername,
                lastMove: ledger.getLastMove()
            }
        });
        
        console.log(`[ConnectionManager] Restored game state for user ${userId} in arena ${arenaId}`);
    }
}