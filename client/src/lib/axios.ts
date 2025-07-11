import axios from "axios";
import useAuthStore from '@/store/useAuthStore';

function getCookieValue(name: string) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1", 
    withCredentials: true, 
});

api.interceptors.request.use((config) => {
    const csrfToken = getCookieValue('t3_csrf_token');
    
    // Ensure headers exist and are mutable
    config.headers = config.headers || {};
  
    if (csrfToken) {
      config.headers['X-T3-CSRF'] = csrfToken;
    }
  
    // Ensure other headers are explicitly retained if needed
    config.headers['Accept'] = config.headers['Accept'] || 'application/json';
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
    
            try {
                await api.post("/refresh");
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
    
        return Promise.reject(error);
    }
);

export default api;
