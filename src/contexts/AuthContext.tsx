/**
 * Authentication Context
 * Manages user authentication state across the application
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "DONOR" | "HOSPITAL" | "BLOOD_BANK";
  bloodGroup?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "DONOR" | "HOSPITAL" | "BLOOD_BANK";
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  bloodBankId?: string;
  hospitalId?: string;
  bloodBankData?: {
    name?: string;
    registrationNo?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    operatingHours?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          bloodGroup: userData.bloodGroup,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const result = await response.json();
      
      // Combine firstName and lastName for display
      const userData = result.data.user;
      setUser({
        id: userData.id,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        bloodGroup: userData.bloodGroup,
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      // try to parse body for better debugging on failure
      const text = await response.text();
      let body: any = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch (e) {
        body = { raw: text };
      }

      if (!response.ok) {
        const message = body?.error || body?.message || body?.raw || `Registration failed (${response.status})`;
        console.error("[register] server response:", response.status, body);
        throw new Error(message);
      }

      const result = body;
      // Registration successful - now login with the credentials
      if (result && result.success) {
        await login(data.email, data.password);
      }
    } catch (error) {
      // surface helpful info in console then rethrow for UI handling
      console.error("[register] error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      // Logout failed
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
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
