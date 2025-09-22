import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useGameState from '@/store/gameState';
import useConnectionStore from '@/store/useConnectionStore';
import socket from '@/lib/socket';

export default function useGameStateRestoration() {
    const router = useRouter();
    const { isConnected, isAuthenticated } = useConnectionStore();
    const { restoreGameState, clearPersistedState } = useGameState();

    useEffect(() => {
        // Only attempt restoration if we're connected and authenticated
        if (!isConnected || !isAuthenticated) return;

        // Check for persisted game state
        const persistedState = localStorage.getItem('tactoe_game_state');
        if (persistedState) {
            try {
                const gameState = JSON.parse(persistedState);
                
                // Check if the persisted state is recent (within last 10 minutes)
                const isRecent = Date.now() - gameState.timestamp < 600000;
                
                if (isRecent && gameState.gameMode === 'online' && gameState.arenaId) {
                    
                    // The server will automatically send game_state_restore if the user was in an active game
                    // We just need to wait for it, or clear the state if no restoration occurs
                    const timeout = setTimeout(() => {
                        clearPersistedState();
                    }, 5000); // 5 second timeout

                    // Listen for game state restoration
                    const handleGameStateRestore = (data: any) => {
                        console.log(`[GameStateRestoration] Server restoration received:`, data);
                        clearTimeout(timeout);
                        restoreGameState(data);
                        
                        // Navigate to game if not already there (async to avoid setState during render)
                        if (router.pathname !== '/game') {
                            setTimeout(() => {
                                router.push('/game');
                            }, 0);
                        }
                    };

                    socket.on('game_state_restore', handleGameStateRestore);

                    return () => {
                        clearTimeout(timeout);
                        socket.off('game_state_restore', handleGameStateRestore);
                    };
                } else {
                    // State is too old, clear it
                    console.log(`[GameStateRestoration] Persisted state is too old, clearing`);
                    clearPersistedState();
                }
            } catch (error) {
                console.error(`[GameStateRestoration] Failed to parse persisted state:`, error);
                clearPersistedState();
            }
        }
    }, [isConnected, isAuthenticated, restoreGameState, clearPersistedState, router]);

    return null;
}
