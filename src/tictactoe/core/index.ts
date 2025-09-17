import setupMatchmaking, { getMatchmakingService, cleanupTimeouts } from "./matchmaking/index.ts";
import connectionManager from "./ConnectionManager.ts";
import { Server, Socket } from "socket.io";

export default async function setupRealtimeEvents(io: Server) {
    io.on("connection", (socket: Socket) => {
        socket.userId = undefined;
        
        //set up connection manager
        connectionManager(socket);

        //setup matchmaking
        setupMatchmaking(io, socket);
    });
    
    return {
        cleanup: () => {
            const matchmakingService = getMatchmakingService();
            if (matchmakingService && matchmakingService.stop) {
                console.log('[Server] Stopping matchmaking service...');
                matchmakingService.stop();
            }
            cleanupTimeouts();
        }
    };
}