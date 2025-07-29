import { create } from 'zustand';
import socket from "@/lib/socket";

interface GameState {
    gameMode: 'offline' | 'online' | null;
    setGameMode: (mode: 'offline' | 'online' | null) => void;
}

export const useGameState = create<GameState>((set, get) => ({
    gameMode: null,
    setGameMode: (mode) => set({ gameMode: mode })
}));