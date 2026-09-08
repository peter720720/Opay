import axios from 'axios';

// Use the deployed API in production and keep localhost available for development.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://opay-57ti.onrender.com/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Pulls your login session token from the browser storage and injects it automatically
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
