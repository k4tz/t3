'use client';

import { calculateRank, getRankColor, type RankInfo } from '@/lib/rank';

interface RankDisplayProps {
    wins: number;
    className?: string;
    showProgress?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function RankDisplay({ 
    wins, 
    className = '', 
    showProgress = false, 
    size = 'md' 
}: RankDisplayProps) {
    const rankInfo: RankInfo = calculateRank(wins);
    const rankColor = getRankColor(rankInfo.tier);
    
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };
    
    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div 
                className={`px-2 py-1 rounded-md font-semibold ${sizeClasses[size]}`}
                style={{ 
                    backgroundColor: `${rankColor}20`, 
                    color: rankColor,
                    border: `1px solid ${rankColor}40`
                }}
            >
                {rankInfo.displayText}
            </div>
            {showProgress && rankInfo.tier !== 'GrandMaster' && (
                <div className="flex items-center space-x-1">
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                                backgroundColor: rankColor,
                                width: `${rankInfo.progress}%`
                            }}
                        />
                    </div>
                    <span className="text-xs text-gray-400">{rankInfo.progress}%</span>
                </div>
            )}
        </div>
    );
}
