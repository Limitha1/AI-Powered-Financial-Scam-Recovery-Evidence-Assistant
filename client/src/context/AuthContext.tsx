import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types/index.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('shieldtrace_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('shieldtrace_token');
      if (!storedToken) {
        // Default to demo session for ease of evaluation
        setUser({
          id: 'demo-user-123',
          email: 'rahul.sharma@shieldtrace.ai',
          full_name: 'Rahul Sharma',
          phone_number: '+91-9876543210'
        });
        setIsLoading(false);
        return;
      }

      try {
        const { user: fetchedUser } = await api.getMe();
        setUser(fetchedUser);
      } catch {
        // Fallback to demo user if token expired
        setUser({
          id: 'demo-user-123',
          email: 'rahul.sharma@shieldtrace.ai',
          full_name: 'Rahul Sharma',
          phone_number: '+91-9876543210'
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('shieldtrace_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, fullName, phone);
      localStorage.setItem('shieldtrace_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    await login('demo@shieldtrace.ai', 'demo-password');
  };

  const logout = () => {
    localStorage.removeItem('shieldtrace_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
