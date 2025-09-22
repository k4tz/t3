'use client';

import { useEffect, useState } from 'react';
import { getRankColor, type RankTier } from '@/lib/rank';
import api from '@/lib/axios';
import Navbar from '@/components/navbar';

interface LeaderboardPlayer {
    rank: number;
    username: string;
    draws: number;
    totalMatches: number;
    tier: string;
    displayText: string;
    progress: number;
    winRate: number;
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leaderboard');
            
            if (response.data.success) {
                setLeaderboard(response.data.leaderboard);
            } else {
                setError(response.data.error || 'Failed to fetch leaderboard');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err 
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to fetch leaderboard'
                : 'Failed to fetch leaderboard';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return `#${rank}`;
        }
    };

    const getRankBadgeColor = (tier: string) => {
        switch (tier) {
            case 'Unranked':
                return 'bg-gray-500';
            case 'Warrior':
                return 'bg-red-500';
            case 'Elite':
                return 'bg-blue-500';
            case 'Master':
                return 'bg-purple-500';
            case 'GrandMaster':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <p className="text-white text-lg mb-4">{error}</p>
                    <button 
                        onClick={fetchLeaderboard}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <div className="container mx-auto px-4 pt-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        🏆 Leaderboard
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Top 10 players ranked by victories
                    </p>
                </div>

                {/* Leaderboard */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Header Row */}
                        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/20 p-6">
                            <div className="grid grid-cols-12 gap-4 text-white font-semibold text-sm">
                                <div className="col-span-1 text-center"></div>
                                <div className="col-span-4">Player</div>
                                <div className="col-span-3 text-center">Current Rank</div>
                                <div className="col-span-2 text-center">Matches</div>
                                <div className="col-span-2 text-center">Win Rate</div>
                            </div>
                        </div>

                        {/* Player Rows */}
                        <div className="divide-y divide-white/10">
                            {leaderboard.map((player, index) => (
                                <div 
                                    key={player.username}
                                    className={`p-6 hover:bg-white/5 transition-all duration-300 ${
                                        index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''
                                    }`}
                                >
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Rank */}
                                        <div className="col-span-1 text-center">
                                            <div className={`text-2xl font-bold ${
                                                index === 0 ? 'text-yellow-400' :
                                                index === 1 ? 'text-gray-300' :
                                                index === 2 ? 'text-orange-400' :
                                                'text-white'
                                            }`}>{index + 1}
                                                {getRankIcon(player.rank)}
                                            </div>
                                        </div>

                                        {/* Player Info */}
                                        <div className="col-span-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {player.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-lg">
                                                        {player.username}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        {player.draws} draws
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Current Rank */}
                                        <div className="col-span-3 text-center">
                                            <div className="flex flex-col items-center space-y-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getRankBadgeColor(player.tier)}`}>
                                                    {player.tier}
                                                </span>
                                                <div className="w-16 bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${player.progress}%`,
                                                            backgroundColor: getRankColor(player.tier as RankTier)
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {player.displayText}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Matches */}
                                        <div className="col-span-2 text-center">
                                            <div className="text-blue-400 font-bold text-lg">
                                                {player.totalMatches}
                                            </div>
                                        </div>

                                        {/* Win Rate */}
                                        <div className="col-span-2 text-center">
                                            <div className="flex flex-col items-center space-y-1">
                                                <div className={`font-bold text-lg ${
                                                    player.winRate >= 70 ? 'text-green-400' :
                                                    player.winRate >= 50 ? 'text-yellow-400' :
                                                    'text-red-400'
                                                }`}>
                                                    {player.winRate}%
                                                </div>
                                                <div className="w-12 bg-gray-700 rounded-full h-1">
                                                    <div 
                                                        className="h-1 rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${player.winRate}%`,
                                                            backgroundColor: player.winRate >= 70 ? '#4ade80' :
                                                                           player.winRate >= 50 ? '#facc15' : '#f87171'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-t border-white/20 p-6 text-center">
                            <p className="text-gray-400 text-sm">
                                Rankings are updated in real-time based on match victories
                            </p>
                        </div>
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="text-center mt-8">
                    <button 
                        onClick={fetchLeaderboard}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        🔄 Refresh Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
}
