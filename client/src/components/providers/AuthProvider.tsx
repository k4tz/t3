"use client";

import useAuthStore from "@/store/useAuthStore";
import { useEffect } from "react";
import Loader from "@/components/loader";
import useAuthSync from "@/hooks/useAuthSync";

export default function AuthProvider({children}: {children: React.ReactNode}) {

    const {initialize, initialized} = useAuthStore();
    
    // Initialize cross-tab auth synchronization
    useAuthSync();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if(!initialized) return <Loader />;

    return children;
}