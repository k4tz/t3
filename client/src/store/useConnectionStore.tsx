import { create } from 'zustand';
import socket from "@/lib/socket";

interface ConnectionState {
    autoInit: boolean;
    isConnected: boolean;
    isAuthenticated: boolean;
    totalActiveUsers: number;
    connectionLost: boolean;
    lastConnectionTime: number | null;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    registerSync: () => () => void;
    registerGlobalListeners: () => () => void;
    connect: () => void;
    disconnect: () => void;
    upgradeToPresenceChannel: () => void;
    leavePresenceChannel: () => void;
    handleConnectionLoss: () => void;
    handleReconnection: () => void;
    resetReconnectAttempts: () => void;
}

const useConnectionStore = create<ConnectionState>((set, get) => ({
    autoInit: false,
    isConnected: socket.connected,
    isAuthenticated: false,
    totalActiveUsers: 0,
    connectionLost: false,
    lastConnectionTime: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    registerSync: () => {
        const cSync = () => {
            const state = get();
            set({ 
                isConnected: true, 
                connectionLost: false,
                lastConnectionTime: Date.now(),
                reconnectAttempts: 0
            });
            
            // Handle reconnection
            if (state.connectionLost) {
                get().handleReconnection();
            }
        }
        
        const dSync = () => {
            set({ 
                isConnected: false,
                connectionLost: true
            });
            get().handleConnectionLoss();
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

        // Matchmaking event listeners
        const matchmakingStatus = (status: string) => {
            console.log(`[Client] Received matchmaking_status: ${status}`);
            // Import useGameState dynamically to avoid circular dependency
            import('./gameState').then(({ default: useGameState }) => {
                useGameState.getState().setMatchmakingStatus(status as any);
            });
        };

        const matchFound = (data: { arenaId: string; opponent: string; opponentId: string; queueTime: number; playerMark: 'X' | 'O' }) => {
            console.log(`[Client] Received match_found:`, data);
            // Import useGameState dynamically to avoid circular dependency
            import('./gameState').then(({ default: useGameState }) => {
                useGameState.getState().setMatchFound(data);
            });
        };

        const error = (message: string) => {
            console.error(`[Client] Socket error:`, message);
        };

        const queueSizeUpdate = (data: { queueSize: number; isLowQueue: boolean }) => {
            console.log(`[Client] Received queue_size_update:`, data);
            // Import useGameState dynamically to avoid circular dependency
            import('./gameState').then(({ default: useGameState }) => {
                useGameState.getState().setQueueSize(data.queueSize, data.isLowQueue);
            });
        };

        socket.on("total_active_users", activeUsers);
        socket.on("matchmaking_status", matchmakingStatus);
        socket.on("match_found", matchFound);
        socket.on("queue_size_update", queueSizeUpdate);
        socket.on("error", error);

        return () => {
            socket.off("total_active_users", activeUsers);
            socket.off("matchmaking_status", matchmakingStatus);
            socket.off("match_found", matchFound);
            socket.off("queue_size_update", queueSizeUpdate);
            socket.off("error", error);
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

    handleConnectionLoss: () => {
        const state = get();
        console.log(`[ConnectionStore] Connection lost, attempts: ${state.reconnectAttempts}`);
        
        // Save current game state to localStorage for recovery
        const gameState = localStorage.getItem('tactoe_game_state');
        if (gameState) {
            localStorage.setItem('tactoe_game_state_backup', gameState);
        }
        
        // Attempt automatic reconnection with exponential backoff
        if (state.reconnectAttempts < state.maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 10000);
            setTimeout(() => {
                const currentState = get();
                if (currentState.connectionLost && !currentState.isConnected) {
                    console.log(`[ConnectionStore] Attempting reconnection ${currentState.reconnectAttempts + 1}/${currentState.maxReconnectAttempts}`);
                    set({ reconnectAttempts: currentState.reconnectAttempts + 1 });
                    socket.connect();
                }
            }, delay);
        }
    },

    handleReconnection: () => {
        console.log(`[ConnectionStore] Reconnected successfully`);
        
        // Restore authentication
        const userId = localStorage.getItem("tactoe_user");
        if (userId) {
            get().upgradeToPresenceChannel();
        }
        
        // Check for game state restoration
        const backupState = localStorage.getItem('tactoe_game_state_backup');
        if (backupState) {
            try {
                const gameState = JSON.parse(backupState);
                if (gameState.arenaId && gameState.gameMode === 'online') {
                    console.log(`[ConnectionStore] Requesting game state restoration for arena ${gameState.arenaId}`);
                    // The server will automatically send game_state_restore if user was in an active game
                }
            } catch (error) {
                console.error(`[ConnectionStore] Failed to parse backup game state:`, error);
            }
        }
    },

    resetReconnectAttempts: () => {
        set({ reconnectAttempts: 0 });
    },
}));

export default useConnectionStore;