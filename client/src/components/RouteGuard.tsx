"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";
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

  const {isAuthenticated, initialized, isLoading} = useAuthStore();
  const router = useRouter();
  
  // Debug logging
  // console.log("RouteGuard state:", { isAuthenticated, initialized, isLoading, accessLevel });
  
  useEffect(() => {
    // Only redirect if auth is initialized and not loading
    if (!initialized || isLoading) return;
    
    if(accessLevel === "auth" && !isAuthenticated){
        console.log("RouteGuard: Redirecting to", redirectTo, "because user is not authenticated");
        router.push(redirectTo);
    }
    
    if(accessLevel === "guest" && isAuthenticated){
        console.log("RouteGuard: Redirecting to / because user is authenticated but page requires guest access");
        router.push('/');
    }
  }, [isAuthenticated, initialized, isLoading, accessLevel, redirectTo, router]);

  // Show loader while auth is initializing
  if (!initialized || isLoading) {
    return <Loader />;
  }

  // Don't render children if access is denied
  if(
    (accessLevel === "auth" && !isAuthenticated) ||
    (accessLevel === "guest" && isAuthenticated)
  ){
    return null;
  }

  return <>{children}</>;
};

export default RouteGuard;