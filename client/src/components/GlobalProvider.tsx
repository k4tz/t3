"use client";

import { createContext, useRef } from "react";

const GlobalContext = createContext({});

export default function GlobalProvider({children}: {children: React.ReactNode}) {
    const connectionEstablished = useRef(false);
    
    const globalCtxData = {
        connectionEstablished
    };

    return <GlobalContext.Provider value={globalCtxData}>{children}</GlobalContext.Provider>
}