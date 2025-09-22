import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';

/**
 * Hook to handle cross-tab authentication synchronization
 * Listens for storage events and syncs auth state across tabs
 */
export default function useAuthSync() {
  const { syncAuthFromStorage } = useAuthStore();

  useEffect(() => {
    // Handle storage events for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      // Handle auth event changes
      if (e.key === 'tactoe_auth_event' && e.newValue) {
        try {
          const eventData = JSON.parse(e.newValue);
          console.log('[AuthSync] Received auth event:', eventData.type);
          
          if (eventData.type === 'login' && eventData.user) {
            // Sync login state
            useAuthStore.getState().setAuth(eventData.user);
            useAuthStore.getState().setToLocalStorage(eventData.user);
            console.log('[AuthSync] Synced login for:', eventData.user.username);
          } else if (eventData.type === 'logout') {
            // Sync logout state
            useAuthStore.getState().setAuth(null);
            useAuthStore.getState().removeFromLocalStorage();
            console.log('[AuthSync] Synced logout');
          }
        } catch (error) {
          console.error('[AuthSync] Error parsing auth event:', error);
        }
      }
      
      // Handle user data changes
      if (e.key === 'tactoe_user_data' && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          useAuthStore.getState().setAuth(userData);
          console.log('[AuthSync] Synced user data from storage:', userData.username);
        } catch (error) {
          console.error('[AuthSync] Error parsing user data:', error);
        }
      }
      
      // Handle user data removal
      if (e.key === 'tactoe_user_data' && e.newValue === null) {
        useAuthStore.getState().setAuth(null);
        console.log('[AuthSync] Synced user data removal');
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Initial sync from storage on mount
    syncAuthFromStorage();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncAuthFromStorage]);
}
