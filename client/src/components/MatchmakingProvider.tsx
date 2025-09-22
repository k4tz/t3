'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useGameState from '@/store/gameState';
import Modal from '@/components/ui/modal';
import MatchmakingUI from '@/components/matchmaking-ui';
import MatchmakingWidget from '@/components/matchmaking-widget';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/axios';

interface MatchmakingContextType {
  openMatchmakingModal: () => void;
  closeMatchmakingModal: () => void;
}

const MatchmakingContext = createContext<MatchmakingContextType | undefined>(undefined);

export function useMatchmaking() {
  const context = useContext(MatchmakingContext);
  if (!context) {
    throw new Error('useMatchmaking must be used within a MatchmakingProvider');
  }
  return context;
}

interface MatchmakingProviderProps {
  children: ReactNode;
}

export default function MatchmakingProvider({ children }: MatchmakingProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasTriggeredMatchFound, setHasTriggeredMatchFound] = useState(false);
  const { matchmakingStatus, arenaId, gameStatus } = useGameState();
  const router = useRouter();
  const { setAuth, setToLocalStorage } = useAuthStore();

  const refreshUserStats = async () => {
    try {
      const res = await api.get('/me');
      if (res?.data) {
        setAuth(res.data);
        setToLocalStorage(res.data);
      }
    } catch {
      // ignore
    }
  };

  const openMatchmakingModal = () => {
    // Don't clear state when opening modal - let the match found flow handle it
    setIsModalOpen(true);
    // Ensure user's rank/wins are fresh for RankDisplay in the modal
    refreshUserStats();
  };

  const closeMatchmakingModal = () => {
    setIsModalOpen(false);
  };

  const handleMatchFound = () => {
    setIsModalOpen(false);
    // Small delay to ensure state is updated before navigation
    setTimeout(() => {
      router.push('/game');
    }, 100);
  };

  // Automatically handle match found state
  useEffect(() => {
    if (matchmakingStatus === 'found' && !hasTriggeredMatchFound) {
      // Only auto-open if this is a genuinely new match (not a restored game)
      // A restoration scenario is when we have an existing game with moves already made
      // (i.e., boardState has non-empty cells, indicating an ongoing game)
      const currentState = useGameState.getState();
      const hasExistingMoves = currentState.boardState.some(row => 
        row.some(cell => cell !== '')
      );
      const isRestorationScenario = hasExistingMoves;
      
      if (!isRestorationScenario) {
        setHasTriggeredMatchFound(true);
        // Show the modal immediately when match is found
        setIsModalOpen(true);
        
        // Auto-start the game after a brief delay to show the "Match Found!" message
        setTimeout(() => {
          handleMatchFound();
        }, 2000); // Show "Match Found!" for 2 seconds before starting
      } else {
        // skip auto-open for restoration
      }
    }
    
    // Reset the trigger flag when matchmaking status changes away from 'found'
    if (matchmakingStatus !== 'found') {
      setHasTriggeredMatchFound(false);
    }
  }, [matchmakingStatus, arenaId, gameStatus, hasTriggeredMatchFound]);

  return (
    <MatchmakingContext.Provider value={{ openMatchmakingModal, closeMatchmakingModal }}>
      {children}
      
      {/* Global Matchmaking Widget */}
      <MatchmakingWidget onOpenModal={openMatchmakingModal} />
      
      {/* Global Matchmaking Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={matchmakingStatus === 'found' ? undefined : closeMatchmakingModal}
        title="Matchmaking"
        showCloseButton={matchmakingStatus === 'idle' || matchmakingStatus === 'cancelled'}
        allowEscapeClose={matchmakingStatus === 'idle' || matchmakingStatus === 'cancelled'}
      >
        <MatchmakingUI 
          isModal={true}
        />
      </Modal>
    </MatchmakingContext.Provider>
  );
}
