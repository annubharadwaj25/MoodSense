import axios from "axios";

export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const getApiAssetUrl = (assetPath) => {
    if (!assetPath) return "";
    return API_URL ? `${API_URL}${assetPath}` : assetPath;
};

// Centralized axios instance — automatically attaches JWT token
// to every request and handles auth errors consistently.
const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor: attach Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: auto-logout on 401 (expired / invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
            // Redirect to login if not already there
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
