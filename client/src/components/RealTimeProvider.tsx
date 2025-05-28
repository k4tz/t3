"use client";

import { useState, useEffect, createContext } from "react";
import { socket } from "@/lib/socket";

const ConnectionContext = createContext({});

export default function ReadTimeProvider({children}: {children: React.ReactNode}) {
    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const [shouldDisconnect, setShouldDisconnect] = useState(false);

    const ctxData = {
        connectionEstablished,
        setConnectionEstablished,
        shouldDisconnect,
        setShouldDisconnect
    };

    useEffect(() => {
        if(!connectionEstablished){
            socket.connect();
            setConnectionEstablished(true);
        }
        if(shouldDisconnect){
            socket.disconnect();
        }
    }, [shouldDisconnect]);

    return (
        <ConnectionContext.Provider value={ctxData}>{children}</ConnectionContext.Provider>
    );
}