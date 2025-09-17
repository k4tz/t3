"use client";

import useGameState from "@/store/gameState";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import useConnectionStore from "@/store/useConnectionStore";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMatchmaking } from "@/components/MatchmakingProvider";

/**
 * 
 * TODO: Sync game mode reset with login/logout events
 */
export default function GameModeSelect(){

    const { gameMode, setGameMode } = useGameState();
    const router = useRouter();
    const [ warning, setWarning ] = useState(false);
    const { openMatchmakingModal } = useMatchmaking();
    const { isAuthenticated } = useAuthStore();
    const { isConnected } = useConnectionStore();

    function startGame(){
        if(!gameMode){
            setWarning(true);
            return;
        }
        if (gameMode === 'online') {
            openMatchmakingModal();
        } else {
            router.push('/game');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <Navbar />
            <div className="container mx-auto px-8 py-20">
                <div className="flex flex-col items-center justify-center min-h-[80vh]">
                    <div className="flex flex-col gap-10 max-w-[600px] min-w-[300px]">
                        <h1 className="text-center text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Select Game Mode
                        </h1>                
                        <div className="flex flex-col gap-4">
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                                <Button 
                                    className={`w-full p-6 text-xl font-semibold transition-all duration-300 ${
                                        gameMode === 'online' 
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                                            : '!bg-gray-500 bg-opacity-20 hover:bg-opacity-30'
                                    }`}
                                    onClick={() => setGameMode('online')}
                                >
                                    Online Multiplayer {gameMode === 'online' && '✅'}
                                </Button>
                            </Card>
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                                <Button 
                                    className={`w-full p-6 text-xl font-semibold transition-all duration-300 ${
                                        gameMode === 'offline' 
                                            ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' 
                                            : '!bg-gray-500 bg-opacity-20 hover:bg-opacity-30'
                                    }`}
                                    onClick={() => setGameMode('offline')}
                                >
                                    Offline Practice {gameMode === 'offline' && '✅'}
                                </Button>
                            </Card>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            {gameMode === "offline" && (
                                <Button 
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 p-4 font-bold text-xl transition-all duration-300 transform hover:scale-105" 
                                    onClick={startGame}
                                >
                                    Start Game
                                </Button>
                            )}
                            {gameMode === "online" && isAuthenticated && (
                                <Button 
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 p-4 font-bold text-xl transition-all duration-300 transform hover:scale-105" 
                                    onClick={startGame}
                                    disabled={!isConnected}
                                >
                                    Join Matchmaking
                                </Button>
                            )}
                            {!isAuthenticated && gameMode === "online" && (
                                <Button 
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 p-4 font-bold text-xl transition-all duration-300 transform hover:scale-105" 
                                    title="Please login before joining an online match" 
                                    onClick={() => router.push('/login')}
                                >
                                    Login Required
                                </Button>
                            )}
                        </div>
                        
                        {!gameMode && warning && (
                            <Card className="bg-red-500 bg-opacity-20 backdrop-blur-sm border-red-500 border-opacity-50">
                                <p className="text-center text-red-300 font-bold p-4">Please select a mode first.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}