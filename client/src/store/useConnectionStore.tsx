import { create } from 'zustand';
import socket from "@/lib/socket";

interface ConnectionState {
    autoInit: boolean;
    isConnected: boolean;
    isAuthenticated: boolean;
    totalActiveUsers: number;
    registerSync: () => () => void;
    registerGlobalListeners: () => () => void;
    connect: () => void;
    disconnect: () => void;
    upgradeToPresenceChannel: () => void;
    leavePresenceChannel: () => void;
}

const useConnectionStore = create<ConnectionState>((set, get) => ({
    autoInit: false,
    isConnected: socket.connected,
    isAuthenticated: false,
    totalActiveUsers: 0,
    registerSync: () => {
        const cSync = () => {
            set({ isConnected: true });
        }
        const dSync = () => {
            set({ isConnected: false });
        }

        socket.on("connect", cSync);
        socket.on("disconnect", dSync);

        return () => {
            socket.off("connect", cSync);
            socket.off("disconnect", dSync);
        }
    },

    registerGlobalListeners: () => {
        const activeUsers = (activeUsersCount: number) => {
            set({ totalActiveUsers: activeUsersCount });
        }

        socket.on("total_active_users", activeUsers);

        return () => {
            socket.off("total_active_users", activeUsers);
        }
    },
    connect: () => {
        if(!socket.connected){
            socket.connect();
            if(!get().autoInit){
                set({ autoInit: true });
            }
        };
    },
    disconnect: () => {
        if(socket.connected){
            console.log("disconnecting...")
            socket.disconnect()
        };
    },
    upgradeToPresenceChannel: () => {
        const userId = localStorage.getItem("tactoe_user");
        if(!userId) return;

        if (socket.connected) {
            socket.emit("authenticate", { userId });
        } else {
            socket.once("connect", () => {
                socket.emit("authenticate", { userId });
            });
        }

        set({ isAuthenticated: true });
    },
    leavePresenceChannel: () => {

        if (socket.connected) {
            socket.emit("leave_presence_channel");
        }

        set({ isAuthenticated: false });
    },
}));

export default useConnectionStore;