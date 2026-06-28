'use client'

import { useState, useContext, createContext, useEffect } from "react"
import api from "@/lib/api"

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const restore = async () => {
            try {
                const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

                if (!storedToken) {
                    setUser(null);
                    if (mounted) setLoading(false);
                    return;
                }

                const res = await api.get('/api/users/profile');
                const serverUser = res?.data?.user ?? null;
                if (serverUser && mounted) {
                    setUser(serverUser);
                }
            } catch (err) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                }
                setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        restore();
        return () => { mounted = false };
    }, [])

    const login = (userData) => {
        if (typeof window !== 'undefined') {
            if (userData?.token) {
                localStorage.setItem('authToken', userData.token);
            } else {
                localStorage.removeItem('authToken');
            }

            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                localStorage.removeItem('user');
            }
        }

        setUser(userData);
    }

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);