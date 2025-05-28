"use client";

import { useEffect } from 'react';
import useConnectionStore from '@/store/useConnectionStore';

export default function ConnectManager() {
    const { 
        autoInit, 
        isConnected, 
        connect, 
        disconnect, 
        registerSync, 
        registerGlobalListeners,
        upgradeToPresenceChannel 
    } = useConnectionStore();

    const reconnect = () => {
        connect();
        upgradeToPresenceChannel();
    }

    useEffect(() => {
        const cleanupRegister = registerSync();
        const cleanupGlobalListeners = registerGlobalListeners();
        connect();
        return () => {
            disconnect();
            cleanupRegister();
            cleanupGlobalListeners();
        };
    }, []);

    if(autoInit && !isConnected){
        return (
            <div className="absolute flex items-center gap-5 top-0 left-[50%] translate-x-[-50%] bg-black border-2 px-4 py-2 transition-opacity">
                <p className="text-white">You have been disconnected</p>                
                <button onClick={reconnect} className="text-white bg-green-600 rounded-md font-bold p-1">
                    Reconnect
                </button>
            </div>
        );
    }

    // return (
    //         <div className="absolute top-0 left-[50%] translate-x-[-50%] bg-black border-2 px-4 py-2">
    //             <button onClick={disconnect}>Disconnect</button>
    //         </div>
    //     );

    return <></>;
}