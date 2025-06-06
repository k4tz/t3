import setupMatchmaking from "./matchmaking.js";
import connectionManager from "./ConnectionManager.js";

export default async function setupRealtimeEvents(io) {
    io.on("connection", (socket) => {
        socket.userID = undefined;
        
        //set up connection manager
        connectionManager(socket);

        //setup matchmaking
        setupMatchmaking(socket);
    });
}