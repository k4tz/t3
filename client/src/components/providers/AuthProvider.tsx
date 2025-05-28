"use client";

import useAuthStore from "@/store/useAuthStore";
import { useEffect } from "react";
import Loader from "@/components/loader";

export default function AuthProvider({children}: {children: React.ReactNode}) {

    const {initialize, initialized} = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if(!initialized) return <Loader />;

    return children;
}