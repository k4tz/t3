"use client";

import { useEffect } from "react";
import Themes from "@/components/themes";
import RouteGuard from "@/components/RouteGuard";
import { useGameState } from "@/store/gameState";
import useAuthStore from '@/store/useAuthStore';
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";

export default function GameLayout({ children }: { children: React.ReactNode }) {
    const {gameMode} = useGameState();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if(!gameMode){
            router.push('/select-mode');
        }
    }, [gameMode, router]);

    if(gameMode === 'online'){
        return (
            <RouteGuard accessLevel="auth">
                <div className="text-white relative">
                    <Themes />
                    {children}
                </div>
            </RouteGuard>
        );
    }else if (gameMode === 'offline'){
        return (
            <div className="text-white relative">
                <Themes />
                {children}
            </div>
        );
    }
    
    return <Loader />;
}