import { connectionStore } from "./ConnectionStore.js";
import ConnectionData from "./ConnectionData.js";
import User from "../../db/models/User.js";

export default function connectionManager(socket) {
    socket.on("authenticate", (data) => {
        console.log("Upgrading user connection to presence channel ID " + data.userId);

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
        console.log("User leaving presence channel");
        if(!socket.userID) return;
        console.log("User leaving has ID: " + socket.userID);
        connectionStore().removeConnection(socket.userID);
        socket.userID = undefined;
    });

    socket.on("disconnect", () => {
        console.log("disconnecting user... ID: " + socket.userID);
        if(socket.userID){
            connectionStore().removeConnection(socket.userID);
            socket.userID = undefined;
        }
    });
}