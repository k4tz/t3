"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from './navbar';
import Loader from "@/components/loader";
import { socket } from "@/lib/socket";
import ReadTimeProvider from "@/components/RealTimeProvider";
import useAuthStore from '@/store/useAuthStore';

const RouteGuard = ({ 
    children, 
    accessLevel = "all", 
    redirectTo = "/login" 
}: { 
    children: React.ReactNode,
    accessLevel?: string,
    redirectTo?: string
 }) => {

  const {user, isAuthenticated} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if(accessLevel === "auth" && !isAuthenticated){
        router.push(redirectTo);
    }
    
    if(accessLevel === "guest" && isAuthenticated){
        router.push('/');
    }
  }, [isAuthenticated, router]);

  if(
    (accessLevel === "auth" && !isAuthenticated) ||
    (accessLevel === "guest" && isAuthenticated)
  ){
    return null;
  }

  return <>{children}</>;
};

export default RouteGuard;