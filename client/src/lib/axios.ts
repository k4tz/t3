import axios from "axios";
import useAuthStore from '@/store/useAuthStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", 
    withCredentials: true, 
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
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
