import { create } from 'zustand';
import socket from "@/lib/socket";

interface GameState {
    gameMode: 'offline' | 'online' | null;
    setGameMode: (mode: 'offline' | 'online' | null) => void;
    startMatchmaking: () => void;
}

const useGameState = create<GameState>((set, get) => ({
    gameMode: null,
    setGameMode: (mode) => set({ gameMode: mode }),
    startMatchmaking: () => {
        socket.emit('start-matchmaking');
    }
}));

export default useGameState;