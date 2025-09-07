"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (userData: RegisterData) => Promise<boolean>;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    graduationYear: number;
    degree: string;
    major: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                setLoading(false);
                return;
            }

            setToken(storedToken);
            const response = await fetch("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                localStorage.removeItem("token");
                setToken(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem("token");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const { user, token } = await response.json();
                localStorage.setItem("token", token);
                setToken(token);
                setUser(user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const { user, token } = await response.json();
                localStorage.setItem("token", token);
                setToken(token);
                setUser(user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Registration failed:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, logout, register }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
