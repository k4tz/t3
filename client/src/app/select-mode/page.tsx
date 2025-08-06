"use client";

import useGameState from "@/store/gameState";
import { useRouter } from "next/navigation";
import { useState } from "react";
import  BackArrow  from "@/components/ui/back-arrow";
import useAuthStore from "@/store/useAuthStore";
import useConnectionStore from "@/store/useConnectionStore";

/**
 * 
 * TODO: Sync game mode reset with login/logout events
 */
export default function GameModeSelect(){

    const { gameMode, setGameMode } = useGameState();
    const router = useRouter();
    const [ warning, setWarning ] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { isConnected } = useConnectionStore();

    function startGame(){
        if(!gameMode){
            setWarning(true);
            return;
        }
        router.push('/game');
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center">
            <BackArrow />
            <div className="flex flex-col gap-10 max-w-[600px] min-w-[300px]">
                <h1 className="text-center text-3xl">Select Game Mode</h1>                
                <div className="flex flex-col gap-2">
                    <button className="btn bg-green-500 p-2 font-bold text-xl hover:bg-green-700" onClick={() => setGameMode('online')}>Online {gameMode === 'online' && '✅'}</button>
                    <button className="btn bg-red-500 p-2 font-bold text-xl hover:bg-red-700" onClick={() => setGameMode('offline')}>Offline {gameMode === 'offline' && '✅'}</button>
                </div>
                {gameMode === "offline" && <button className="w-full bg-teal-500 hover:bg-teal-700  p-2 font-bold text-xl" onClick={startGame}>Start Game</button>}
                {gameMode === "online" && isAuthenticated && <button className="w-full bg-teal-500 hover:bg-teal-700  p-2 font-bold text-xl" onClick={startGame} disabled={!isConnected}>Join Matchmaking</button>}
                {!isAuthenticated && gameMode === "online" && <button className="w-full bg-teal-500 hover:bg-teal-700  p-2 font-bold text-xl" title="Please login before joining an online match" onClick={() => router.push('/login')}>Login</button>}
                {!gameMode && warning && <p className="text-center text-red-500 font-bold">Please select a mode first.</p>}
            </div>
        </div>
    );
}