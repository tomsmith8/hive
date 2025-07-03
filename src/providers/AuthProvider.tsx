'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Development test user
const DEV_TEST_USER: AuthUser = {
  id: 'dev-user-1',
  ownerPubKey: 'dev-pubkey-123456789',
  ownerAlias: 'Dev User',
  role: 'admin',
  name: 'Development User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      // Verify token and set user
      verifyToken(token);
    } else {
      // Check if we're in development mode and should auto-login
      if (process.env.NODE_ENV === 'development') {
        const devBypass = localStorage.getItem('dev_auth_bypass');
        if (devBypass === 'true') {
          // Auto-login with test user in development
          setUser(DEV_TEST_USER);
          localStorage.setItem('jwt_token', 'dev-jwt-token');
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // In development, if it's our dev token, just set the user
      if (token === 'dev-jwt-token' && process.env.NODE_ENV === 'development') {
        setUser(DEV_TEST_USER);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('jwt_token');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('jwt_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    // This will be implemented by the login component
    // For now, it's a placeholder
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('dev_auth_bypass');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 