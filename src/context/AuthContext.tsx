import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { User } from '../types';
import { decodeJWT } from '../utils';

interface AuthContextType {
  user: User | null;
  token: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  refetchUser: () => Promise<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  });

  const [userId, setUserId] = useState<number | null>(() => {
    const savedId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    return savedId ? Number(savedId) : null;
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('password');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUserId(null);
    setUser(null);
  }, []);

  const fetchUserProfile = useCallback(async (id: number): Promise<User | null> => {
    try {
      const response = await api.get<User>(`users/${id}`);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      logout();
      return null;
    }
  }, [logout]);

  const refetchUser = useCallback(async () => {
    if (userId) {
      return await fetchUserProfile(userId);
    }
    return null;
  }, [userId, fetchUserProfile]);

  useEffect(() => {
    const initAuth = async () => {
      if (token && userId) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchUserProfile(userId);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token, userId, fetchUserProfile]);

  const login = async (newToken: string, remember: boolean): Promise<boolean> => {
    try {
      const decoded = decodeJWT(newToken);
      if (!decoded || !decoded.id) {
        throw new Error('Token inválido');
      }

      const id = decoded.id;

      if (remember) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', id.toString());
      } else {
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('userId', id.toString());
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUserId(id);

      const profile = await fetchUserProfile(id);
      return !!profile;
    } catch (error) {
      console.error('Falha no login:', error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userId,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refetchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
