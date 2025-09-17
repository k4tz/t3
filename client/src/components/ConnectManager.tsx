"use client";

import { useEffect, useState } from 'react';
import useConnectionStore from '@/store/useConnectionStore';
import socket from '@/lib/socket';

export default function ConnectManager() {
    const { 
        autoInit, 
        isConnected, 
        connectionLost,
        reconnectAttempts,
        maxReconnectAttempts,
        connect, 
        disconnect, 
        registerSync, 
        registerGlobalListeners,
        upgradeToPresenceChannel,
        resetReconnectAttempts
    } = useConnectionStore();

    const [hasInitiallyConnected, setHasInitiallyConnected] = useState(false);

    const reconnect = () => {
        resetReconnectAttempts();
        connect();
        upgradeToPresenceChannel();
    }

    useEffect(() => {
        const cleanupRegister = registerSync();
        const cleanupGlobalListeners = registerGlobalListeners();
        connect();
        
        // Track if we've ever been connected to prevent initial flash
        const handleConnect = () => {
            setHasInitiallyConnected(true);
        };
        
        socket.on('connect', handleConnect);
        
        return () => {
            disconnect();
            cleanupRegister();
            cleanupGlobalListeners();
            socket.off('connect', handleConnect);
        };
    }, []);

    // Only show disconnect message if we've been connected before and are now disconnected
    if(autoInit && !isConnected && hasInitiallyConnected){
        const isReconnecting = connectionLost && reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts;
        const reconnectFailed = connectionLost && reconnectAttempts >= maxReconnectAttempts;
        
        return (
            <div className="fixed flex flex-col items-center gap-2 bottom-4 left-1/2 transform -translate-x-1/2 md:top-20 md:left-4 md:bottom-auto md:transform-none md:flex-row md:gap-3 bg-black/90 backdrop-blur-sm border border-red-500/50 px-4 py-3 rounded-lg shadow-lg z-40 transition-all duration-300">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isReconnecting ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <p className="text-white text-sm font-medium">
                        {isReconnecting ? `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})` : 
                         reconnectFailed ? 'Connection failed' : 'Connection lost'}
                    </p>
                </div>
                <p className="text-gray-300 text-xs text-center md:hidden">Connection required for online play</p>
                <button 
                    onClick={reconnect} 
                    className="text-white bg-green-600 hover:bg-green-700 rounded-md font-bold px-3 py-1 text-sm transition-colors duration-200"
                >
                    {isReconnecting ? 'Cancel' : 'Reconnect'}
                </button>
                {/* Desktop tooltip */}
                <div className="hidden md:block relative group">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Connection required for online play
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                </div>
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