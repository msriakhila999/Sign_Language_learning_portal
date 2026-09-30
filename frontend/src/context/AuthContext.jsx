import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('signbridge_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            if (token) {
                try {
                    const data = await api.getMe();
                    setUser(data.user);
                } catch (error) {
                    console.warn('Invalid token, logging out:', error.message);
                    logout();
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        }

        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        const data = await api.login({ email, password });
        localStorage.setItem('signbridge_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const data = await api.register({ name, email, password });
        localStorage.setItem('signbridge_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('signbridge_token');
        setToken(null);
        setUser(null);
    };

    const updateUserState = (updatedUser) => {
        setUser((prev) => ({ ...prev, ...updatedUser }));
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, register, logout, updateUserState }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
