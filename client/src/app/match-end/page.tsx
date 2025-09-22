'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useGameState from '@/store/gameState';
import useAuthStore from '@/store/useAuthStore';

interface MatchData {
  winner: string | null;
  opponent: string | null;
  playerMark: 'X' | 'O' | null;
  gameMode: 'offline' | 'online' | null;
}

export default function MatchEndPage() {
  const router = useRouter();
  const { cleanupGameState } = useGameState();
  const { user } = useAuthStore();
  
  // Local component state for match data
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [countdown, setCountdown] = useState(10); // 10 second countdown
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Get match data from game state before cleaning up
    const gameState = useGameState.getState();
    
    console.log('[MatchEnd] Game state data:', {
      winner: gameState.winner,
      opponent: gameState.opponent,
      playerMark: gameState.playerMark,
      gameMode: gameState.gameMode,
      gameStatus: gameState.gameStatus,
      user: user
    });
    
    // Only proceed if this is an online game
    if (gameState.gameMode !== 'online') {
      console.log('[MatchEnd] Not an online game, redirecting to select-mode');
      router.push('/select-mode');
      return;
    }
    
    const matchInfo: MatchData = {
      winner: gameState.winner,
      opponent: gameState.opponent,
      playerMark: gameState.playerMark,
      gameMode: gameState.gameMode
    };
    
    console.log('[MatchEnd] Setting match data:', matchInfo);
    
    // Set local state with match data
    setMatchData(matchInfo);
    
    // Show animation for 3 seconds, then show countdown
    const animationTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 3000);

    // Start countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsExiting(true);
          // Clean up game state and redirect
          cleanupGameState();
          router.push('/select-mode');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(animationTimer);
      clearInterval(countdownInterval);
    };
  }, [cleanupGameState, router, user]);


  // Determine the winner display
  const getWinnerDisplay = () => {
    console.log('[MatchEnd] getWinnerDisplay called with:', {
      winner: matchData?.winner,
      matchData: matchData
    });
    
    if (!matchData?.winner || matchData.winner === 'draw') return 'Draw!';
    
    // For online games, winner is the username
    return matchData.winner;
  };

  const getMatchTitle = () => {
    if (matchData?.gameMode === 'online') {
      const currentUsername = user?.username || 'Unknown Player';
      const opponentName = matchData.opponent || 'Unknown Player';
      
      console.log('[MatchEnd] Match title data:', {
        currentUsername,
        opponentName,
        playerMark: matchData.playerMark,
        user: user,
        matchData: matchData
      });
      
      if (matchData.playerMark === 'X') {
        return `${currentUsername} vs ${opponentName}`;
      } else {
        return `${opponentName} vs ${currentUsername}`;
      }
    } else {
      return 'Player X vs Player O';
    }
  };

  // Show loading if match data is not available yet
  if (!matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading match result...</div>
      </div>
    );
  }

  // Debug: Show current state
  console.log('[MatchEnd] Current state:', {
    matchData,
    user,
    showAnimation
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
        {/* Match Title */}
        <div className="mb-6">
          <h2 className="text-xl text-gray-300 mb-2">Match Result</h2>
          <div className="text-lg text-blue-400 font-medium">
            {getMatchTitle()}
          </div>
        </div>

        {/* Winner Display */}
        <div className="mb-8">
          {showAnimation ? (
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">
                {matchData.winner && matchData.winner !== 'draw' ? '🏆' : '🤝'}
              </div>
              <div className="text-3xl font-bold text-yellow-400 animate-pulse">
                {matchData.winner && matchData.winner !== 'draw' ? `${getWinnerDisplay()} Wins!` : 'Draw!'}
              </div>
              <div className="text-sm text-gray-400 animate-pulse">
                {matchData.winner && matchData.winner !== 'draw' ? 'Victory!' : 'Well played!'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">
                {matchData.winner && matchData.winner !== 'draw' ? '🏆' : '🤝'}
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {matchData.winner && matchData.winner !== 'draw' ? `${getWinnerDisplay()} Wins!` : 'Draw!'}
              </div>
              <div className="text-sm text-gray-400">
                {matchData.winner && matchData.winner !== 'draw' ? 'Congratulations!' : 'Well played!'}
              </div>
            </div>
          )}
        </div>

        {/* Auto-exit Countdown */}
        {!showAnimation && !isExiting && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-lg text-gray-300 mb-2">
                Returning to menu in:
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-4 animate-pulse">
                {countdown}
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400">
                Thank you for playing!
              </div>
            </div>
          </div>
        )}

        {/* Exiting Message */}
        {isExiting && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-lg text-gray-300 mb-2">
                Returning to menu...
              </div>
              <div className="text-sm text-gray-400">
                Please wait
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
