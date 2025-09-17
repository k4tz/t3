'use client';

import { useEffect } from 'react';
import useGameState from '@/store/gameState';
import { Button } from '@/components/ui/button';

interface MatchmakingUIProps {
    onMatchFound?: () => void;
    isModal?: boolean;
}

export default function MatchmakingUI({ onMatchFound, isModal = false }: MatchmakingUIProps) {
    const { 
        matchmakingStatus, 
        queueTime, 
        opponent, 
        startMatchmaking, 
        cancelMatchmaking 
    } = useGameState();

    // Remove automatic onMatchFound handling - let MatchmakingProvider handle it

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (matchmakingStatus === 'idle') {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Play?</h2>
                <p className="text-gray-300 mb-6">Join the matchmaking queue to find an opponent</p>
                <Button 
                    onClick={startMatchmaking}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 p-4 font-bold text-xl transition-all duration-300 transform hover:scale-105"
                >
                    Find Match
                </Button>
            </div>
        );
    }

    if (matchmakingStatus === 'searching') {
        return (
            <div className="text-center">
                <div className="mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">Searching for Opponent</h2>
                    <p className="text-gray-300 mb-4">Finding the perfect match...</p>
                </div>
                
                <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
                    <div className="text-3xl font-mono text-green-400 mb-2">
                        {formatTime(queueTime)}
                    </div>
                    <div className="text-sm text-gray-400">Queue Time</div>
                </div>
                
                <div className="flex gap-3">
                    <Button 
                        onClick={cancelMatchmaking}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 p-3 font-bold transition-all duration-300"
                    >
                        Cancel Search
                    </Button>
                </div>
            </div>
        );
    }

    if (matchmakingStatus === 'found') {
        return (
            <div className="text-center">
                <div className="mb-4">
                    <div className="text-4xl mb-4">🎮</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Match Found!</h2>
                    <p className="text-gray-300 mb-4">Starting game...</p>
                </div>
                
                <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
                    <div className="text-lg text-blue-400 mb-2">
                        vs {opponent || 'Unknown Player'}
                    </div>
                    <div className="text-sm text-gray-400">Opponent</div>
                </div>
                
                <div className="text-sm text-gray-400">
                    Match found in {formatTime(queueTime)}
                </div>
            </div>
        );
    }

    if (matchmakingStatus === 'cancelled') {
        return (
            <div className="text-center">
                <div className="mb-4">
                    <div className="text-4xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Search Cancelled</h2>
                    <p className="text-gray-300 mb-6">You left the matchmaking queue</p>
                </div>
                
                <Button 
                    onClick={startMatchmaking}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 p-4 font-bold text-xl transition-all duration-300 transform hover:scale-105"
                >
                    Search Again
                </Button>
            </div>
        );
    }

    return null;
}
