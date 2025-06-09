import { connectionStore } from "../stores/connection/ConnectionStore.js";
import ConnectionData from "../stores/connection/ConnectionData.js";
import User from "../../db/models/User.js";

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
        socket.userID = data.userId;
    });

    socket.on("leave_presence_channel", (data) => {
        if(!socket.userID) return;
        console.log("User leaving has ID: " + socket.userID);
        connectionStore().removeConnection(socket.userID);
        socket.userID = undefined;
    });

    socket.on("disconnect", () => {
        if(socket.userID){
            connectionStore().removeConnection(socket.userID);
            socket.userID = undefined;
        }
    });
}