import matchmakingRT from "./matchmaking.js";
import connectionManager from "./ConnectionManager.js";
import { connectionStore } from "./ConnectionStore.js";

export default async function t2oeRT(io) {
    io.on("connection", (socket) => {
        socket.userID = undefined;
        console.log("A user connected. Guest right now. SocketID: " + socket.id);
        //set up connection manager
        connectionManager(socket);        
    });

    setInterval(() => {
        io.emit("total_active_users", connectionStore().totalConnections());
    }, process.env.GLOBAL_EVENT_BROADCAST_INTERVAL || 5000);
}