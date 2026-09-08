import axios from 'axios';

// Use the local API during development and the deployed API in production.
const configuredApiUrl = import.meta.env.VITE_API_URL;
const normalizedApiUrl = configuredApiUrl?.replace(/\/$/, '');
const API_BASE_URL = configuredApiUrl
    ? `${normalizedApiUrl}${normalizedApiUrl.endsWith('/api') ? '' : '/api'}`
    : (
    import.meta.env.DEV
        ? 'http://localhost:5000/api'
        : 'https://opay-57ti.onrender.com/api'
    );

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
