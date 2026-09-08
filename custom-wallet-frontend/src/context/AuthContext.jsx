import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    const res = await apiClient.get('/auth/profile');
                    if (res.data.success) {
                        setUser(res.data);
                    }
                } catch (err) {
                    console.error("Session token validation failed:", err.message);
                    logout();
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (userData) => {
        localStorage.setItem('userToken', userData.token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setUser(null);
    };

    const refreshBalance = async () => {
        try {
            const res = await apiClient.get('/auth/profile');
            if (res.data.success) {
                setUser(prev => ({ ...prev, balance: res.data.balance }));
            }
        } catch (err) {
            console.error("Failed to refresh balance snapshot:", err.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshBalance }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
