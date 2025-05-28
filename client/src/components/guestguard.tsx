"use client";

import { useState, useEffect } from 'react';
import { getAuthStatus } from "@/lib/auth";
import { useRouter } from "next/navigation";

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      if(getAuthStatus()){
        router.push('/');
      }else{
        setLoading(false);
      }
    }, [router]);
    
  
    if (loading) return null;
  
    return children;
};

export default GuestGuard;