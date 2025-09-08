"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (
        userData: RegisterData
    ) => Promise<{ success: boolean; requiresVerification?: boolean }>;
    resendVerification: (email: string) => Promise<boolean>;
    refreshUser: () => Promise<void>;
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

            // Check if we have cached user data first
            const cachedUser = localStorage.getItem("user");
            if (cachedUser) {
                try {
                    const userData = JSON.parse(cachedUser);
                    setUser(userData);
                    setLoading(false);

                    // Verify in background without blocking UI
                    verifyTokenInBackground(storedToken);
                    return;
                } catch (e) {
                    // Invalid cached data, continue with normal flow
                    localStorage.removeItem("user");
                }
            }

            const response = await fetch("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                // Cache user data for faster future loads
                localStorage.setItem("user", JSON.stringify(userData));
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setToken(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const verifyTokenInBackground = async (token: string) => {
        try {
            const response = await fetch("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // Token is invalid, force logout
                logout();
            }
        } catch (error) {
            console.error("Background token verification failed:", error);
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
                localStorage.setItem("user", JSON.stringify(user));
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
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    const register = async (
        userData: RegisterData
    ): Promise<{ success: boolean; requiresVerification?: boolean }> => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const { user, token, requiresEmailVerification } =
                    await response.json();
                localStorage.setItem("token", token);
                setToken(token);
                setUser(user);
                return {
                    success: true,
                    requiresVerification: requiresEmailVerification,
                };
            }
            return { success: false };
        } catch (error) {
            console.error("Registration failed:", error);
            return { success: false };
        }
    };

    const resendVerification = async (email: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            return response.ok;
        } catch (error) {
            console.error("Resend verification failed:", error);
            return false;
        }
    };

    const refreshUser = async (): Promise<void> => {
        if (!token) return;

        try {
            const response = await fetch("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                register,
                resendVerification,
                refreshUser,
            }}
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
