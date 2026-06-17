'use client'

import { useState, useContext, createContext, useEffect } from "react"
import api from "@/lib/api"

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session: try server-side profile first, fall back to localStorage
    useEffect(() => {
        let mounted = true;
        const restore = async () => {
            try {
                const res = await api.get('/api/users/profile');
                const serverUser = res?.data?.user ?? null;
                if (serverUser && mounted) {
                    setUser(serverUser);
                }
            } catch (err) {
                // Cookie invalid ya expired — user logged out
                setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        restore();
        return () => { mounted = false };
    }, [])

    const login = (userData) => {
        setUser(userData);
    }

    const logout = () => {
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);