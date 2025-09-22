import { create } from 'zustand';
import socket from "@/lib/socket";

interface GameState {
    gameMode: 'offline' | 'online' | null;
    setGameMode: (mode: 'offline' | 'online' | null) => void;
    
    // Matchmaking state
    matchmakingStatus: 'idle' | 'searching' | 'found' | 'cancelled';
    queueTime: number;
    queueSize: number;
    isLowQueue: boolean;
    opponent: string | null;
    arenaId: string | null;
    
    // Game state for online mode
    boardState: string[][];
    currentPlayer: 'X' | 'O' | null;
    playerMark: 'X' | 'O' | null;
    gameStatus: 'waiting' | 'playing' | 'finished';
    winner: string | null;
    winnerPlacements: number[];
    
    
    
    // Actions
    startMatchmaking: () => void;
    cancelMatchmaking: () => void;
    updateQueueTime: () => void;
    setQueueSize: (queueSize: number, isLowQueue: boolean) => void;
    setMatchFound: (data: { arenaId: string; opponent: string; opponentId: string; queueTime: number; playerMark: 'X' | 'O' }) => void;
    setMatchmakingStatus: (status: 'idle' | 'searching' | 'found' | 'cancelled') => void;
    makeMove: (row: number, col: number) => void;
    updateGameState: (boardState: string[][], currentPlayer: 'X' | 'O', winner?: string, winnerPlacements?: number[]) => void;
    resetGame: () => void;
    exitMatch: () => void;
    cleanupGameState: () => void;
    
    // State persistence and restoration
    saveGameState: () => void;
    restoreGameState: (data: any) => void;
    clearPersistedState: () => void;
}

const useGameState = create<GameState>((set, get) => ({
    gameMode: null,
    setGameMode: (mode) => set({ gameMode: mode }),
    
    // Matchmaking state
    matchmakingStatus: 'idle',
    queueTime: 0,
    queueSize: 0,
    isLowQueue: false,
    opponent: null,
    arenaId: null,
    
    // Game state
    boardState: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ],
    currentPlayer: null,
    playerMark: null,
    gameStatus: 'waiting',
    winner: null,
    winnerPlacements: [],
    
    
    
    // Actions
    startMatchmaking: () => {
        const state = get();
        // Set game mode to online when starting matchmaking
        set({ gameMode: 'online' });
        
        // Clear any existing game state before starting new matchmaking
        if (state.arenaId || state.matchmakingStatus === 'found') {
                console.log(`[GameState] Clearing existing game state before starting new matchmaking`);
                set({
                    arenaId: null,
                    opponent: null,
                    winner: null,
                    boardState: [
                        ['', '', ''],
                        ['', '', ''],
                        ['', '', '']
                    ],
                    currentPlayer: null,
                    playerMark: null,
                    gameStatus: 'waiting',
                    winnerPlacements: []
                });
            }
            
            socket.emit('join_matchmaking');
            set({ 
                matchmakingStatus: 'searching',
                queueTime: 0,
                opponent: null,
                arenaId: null
            });
            
            // Start queue timer
            const timer = setInterval(() => {
                set((state) => ({ queueTime: state.queueTime + 1 }));
            }, 1000);
            
            // Store timer reference for cleanup
            (window as Window & { matchmakingTimer?: NodeJS.Timeout }).matchmakingTimer = timer;
    },
    
    cancelMatchmaking: () => {
        socket.emit('leave_matchmaking');
        set({ 
            matchmakingStatus: 'cancelled',
            queueTime: 0,
            opponent: null,
            arenaId: null
        });
        
        // Clear timer
        const windowWithTimer = window as Window & { matchmakingTimer?: NodeJS.Timeout };
        if (windowWithTimer.matchmakingTimer) {
            clearInterval(windowWithTimer.matchmakingTimer);
            windowWithTimer.matchmakingTimer = undefined;
        }
    },
    
    updateQueueTime: () => {
        set((state) => ({ queueTime: state.queueTime + 1 }));
    },
    
    setMatchFound: (data) => {
        console.log(`[GameState] Setting match found:`, data);
        set({
            gameMode: 'online',
            matchmakingStatus: 'found',
            arenaId: data.arenaId,
            opponent: data.opponent, // This is now the username
            queueTime: data.queueTime,
            gameStatus: 'playing',
            boardState: [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ],
            currentPlayer: 'X',
            playerMark: data.playerMark, // Set immediately from server
            winner: null
        });
        
        // Players are already added to arena during matchmaking, no need to join again
        console.log(`[GameState] Match found, players already in arena: ${data.arenaId}, player mark: ${data.playerMark}`);
        
        // Clear timer
        const windowWithTimer = window as Window & { matchmakingTimer?: NodeJS.Timeout };
        if (windowWithTimer.matchmakingTimer) {
            clearInterval(windowWithTimer.matchmakingTimer);
            windowWithTimer.matchmakingTimer = undefined;
        }
    },
    
    setMatchmakingStatus: (status) => {
        set({ matchmakingStatus: status });
    },
    
    setQueueSize: (queueSize, isLowQueue) => {
        set({ queueSize, isLowQueue });
    },
    
    makeMove: (row, col) => {
        const state = get();
        console.log(`[GameState] makeMove called:`, { row, col, state: { gameMode: state.gameMode, arenaId: state.arenaId, currentPlayer: state.currentPlayer, playerMark: state.playerMark } });
        
        if (state.gameMode === 'online' && state.arenaId && state.currentPlayer === state.playerMark) {
            console.log(`[GameState] Emitting make_move to server`);
            socket.emit('make_move', { 
                arenaId: state.arenaId, 
                row, 
                col 
            });
        } else {
            console.log(`[GameState] Move not sent:`, {
                isOnline: state.gameMode === 'online',
                hasArena: !!state.arenaId,
                isPlayerTurn: state.currentPlayer === state.playerMark
            });
        }
    },
    
    updateGameState: (boardState, currentPlayer, winner, winnerPlacements) => {
        set({
            boardState,
            currentPlayer,
            winner: winner || null,
            winnerPlacements: winnerPlacements || [],
            gameStatus: winner ? 'finished' : 'playing'
        });
        get().saveGameState();
    },
    
    
    resetGame: () => {
        set({
            matchmakingStatus: 'idle',
            queueTime: 0,
            opponent: null,
            arenaId: null,
            boardState: [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ],
            currentPlayer: null,
            playerMark: null,
            gameStatus: 'waiting',
            winner: null,
            winnerPlacements: []
        });
        
        // Clear timer
        const windowWithTimer = window as Window & { matchmakingTimer?: NodeJS.Timeout };
        if (windowWithTimer.matchmakingTimer) {
            clearInterval(windowWithTimer.matchmakingTimer);
            windowWithTimer.matchmakingTimer = undefined;
        }
    },
    
    cleanupGameState: () => {
        console.log(`[GameState] Cleaning up game state after victory`);
        
        // Clear all game-related state
        set({
            matchmakingStatus: 'idle',
            queueTime: 0,
            opponent: null,
            arenaId: null,
            boardState: [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ],
            currentPlayer: null,
            playerMark: null,
            gameStatus: 'waiting',
            winner: null,
            winnerPlacements: []
        });
        
        // Clear persisted state
        localStorage.removeItem('tactoe_game_state');
        localStorage.removeItem('tactoe_game_state_backup');
        
        // Clear timer
        const windowWithTimer = window as Window & { matchmakingTimer?: NodeJS.Timeout };
        if (windowWithTimer.matchmakingTimer) {
            clearInterval(windowWithTimer.matchmakingTimer);
            windowWithTimer.matchmakingTimer = undefined;
        }
        
        console.log(`[GameState] Game state cleanup completed`);
    },

    exitMatch: () => {
        const state = get();
        console.log(`[GameState] Exiting match, clearing all state`);
        
        // Clear all game state
        set({
            matchmakingStatus: 'idle',
            queueTime: 0,
            opponent: null,
            arenaId: null,
            boardState: [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ],
            currentPlayer: null,
            playerMark: null,
            gameStatus: 'waiting',
            winner: null,
            winnerPlacements: []
        });
        
        // Clear persisted state
        localStorage.removeItem('tactoe_game_state');
        localStorage.removeItem('tactoe_game_state_backup');
        
        // Clear timer
        const windowWithTimer = window as Window & { matchmakingTimer?: NodeJS.Timeout };
        if (windowWithTimer.matchmakingTimer) {
            clearInterval(windowWithTimer.matchmakingTimer);
            windowWithTimer.matchmakingTimer = undefined;
        }
        
        console.log(`[GameState] Match exit cleanup completed`);
    },

    saveGameState: () => {
        const state = get();
        if (state.gameMode === 'online' && state.arenaId) {
            const gameState = {
                gameMode: state.gameMode,
                arenaId: state.arenaId,
                opponent: state.opponent,
                playerMark: state.playerMark,
                boardState: state.boardState,
                currentPlayer: state.currentPlayer,
                gameStatus: state.gameStatus,
                winner: state.winner,
                timestamp: Date.now()
            };
            localStorage.setItem('tactoe_game_state', JSON.stringify(gameState));
            console.log(`[GameState] Saved game state for arena ${state.arenaId}`);
        }
    },

    restoreGameState: (data) => {
        console.log(`[GameState] Restoring game state:`, data);
        set({
            gameMode: 'online',
            arenaId: data.arenaId,
            opponent: data.opponent,
            playerMark: data.playerMark,
            boardState: data.gameState.board,
            currentPlayer: data.gameState.currentPlayer,
            gameStatus: data.gameState.winner ? 'finished' : 'playing',
            winner: data.gameState.winner,
            matchmakingStatus: 'idle' // Set to idle since we're restoring an existing game, not finding a new match
        });
        
        // Clear backup state
        localStorage.removeItem('tactoe_game_state_backup');
        console.log(`[GameState] Game state restored for arena ${data.arenaId}`);
    },

    clearPersistedState: () => {
        localStorage.removeItem('tactoe_game_state');
        localStorage.removeItem('tactoe_game_state_backup');
        console.log(`[GameState] Cleared persisted game state`);
    },

    calculateWinnerPlacements: (boardState: string[][], winner: string) => {
        if (!winner || winner === 'draw') return [];
        
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (boardState[i][0] && boardState[i][0] === boardState[i][1] && boardState[i][0] === boardState[i][2]) {
                return [3*i + 0, 3*i + 1, 3*i + 2];
            }
        }
        
        // Check columns
        for (let i = 0; i < 3; i++) {
            if (boardState[0][i] && boardState[0][i] === boardState[1][i] && boardState[0][i] === boardState[2][i]) {
                return [3*0 + i, 3*1 + i, 3*2 + i];
            }
        }
        
        // Check diagonals
        if (boardState[0][0] && boardState[0][0] === boardState[1][1] && boardState[0][0] === boardState[2][2]) {
            return [0, 4, 8];
        }
        
        if (boardState[0][2] && boardState[0][2] === boardState[1][1] && boardState[0][2] === boardState[2][0]) {
            return [2, 4, 6];
        }
        
        return [];
    }
}));

export default useGameState;