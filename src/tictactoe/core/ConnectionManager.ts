import connectionStore from "../stores/connection/ConnectionStore.ts";
import ConnectionData, { UserConnectionData } from "../stores/connection/ConnectionData.ts";
import User from "../../db/models/User.ts";

export default function connectionManager(socket) {
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