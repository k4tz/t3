import { connectionStore } from "../stores/connection/ConnectionStore.js";
import ConnectionData from "../stores/connection/ConnectionData.js";
import User from "../../db/models/User.ts";

export default function connectionManager(socket) {
    socket.on("authenticate", (data) => {
        //check if a previous connection exists and if it does, we properly remove and disconnect it
        let previousConnection = connectionStore().getConnection(data.userId)
        if(previousConnection){
            previousConnection.conn.disconnect();
        }

        //get the user for the id
        let user = User.findById(data.userId);
        
        const connectionData = new ConnectionData(user, socket);

        connectionStore().setConnection(data.userId, connectionData);
        socket.userId = data.userId;
    });

    socket.on("leave_presence_channel", (data) => {
        if(!socket.userId) return;
        connectionStore().removeConnection(socket.userId);
        socket.userId = undefined;
    });

    socket.on("disconnect", () => {
        if(socket.userId){
            connectionStore().removeConnection(socket.userId);
            socket.userId = undefined;
        }
    });
}