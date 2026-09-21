'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '@/lib/api';

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen?: string;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (updated: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = getAuthToken();
    if (savedToken) {
      setToken(savedToken);
      api.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          clearAuthToken();
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const data = await api.login(credentials);
    setAuthToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (userData: any) => {
    const data = await api.register(userData);
    setAuthToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
