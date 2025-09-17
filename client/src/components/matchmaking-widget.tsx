'use client';

import { useEffect, useState } from 'react';
import useGameState from '@/store/gameState';
import { Button } from '@/components/ui/button';

interface MatchmakingWidgetProps {
  onOpenModal: () => void;
}

export default function MatchmakingWidget({ onOpenModal }: MatchmakingWidgetProps) {
  const { 
    matchmakingStatus, 
    queueTime, 
    opponent,
    gameStatus
  } = useGameState();
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show widget only when searching, hide when match is found (modal will open)
    const shouldShow = matchmakingStatus === 'searching';
    setIsVisible(shouldShow);
  }, [matchmakingStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop Widget - Top Left */}
      <div className="hidden md:block fixed top-20 left-4 z-40">
        <div className="bg-gradient-to-r from-slate-800 to-purple-800 backdrop-blur-sm border border-white border-opacity-20 rounded-xl shadow-2xl p-4 min-w-[280px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
              
              <div className="flex flex-col">
                <div className="text-white font-semibold text-sm">
                  Finding Match...
                </div>
                <div className="text-gray-300 text-xs">
                  {formatTime(queueTime)}
                </div>
              </div>
            </div>
            
            <Button
              onClick={onOpenModal}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-xs px-3 py-1 rounded-lg transition-all duration-200"
            >
              View
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Widget - Bottom Center */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-gradient-to-r from-slate-800 to-purple-800 backdrop-blur-sm border border-white border-opacity-20 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
              
              <div className="flex flex-col">
                <div className="text-white font-semibold text-sm">
                  Finding Match...
                </div>
                <div className="text-gray-300 text-xs">
                  {formatTime(queueTime)}
                </div>
              </div>
            </div>
            
            <Button
              onClick={onOpenModal}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-xs px-3 py-1 rounded-lg transition-all duration-200"
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
