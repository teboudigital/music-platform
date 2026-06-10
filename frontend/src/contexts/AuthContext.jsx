/**
 * AuthContext: gestisce lo stato di autenticazione globale.
 * Fornisce: user, login(), logout(), isAuthenticated, loading.
 * I token JWT vengono salvati in localStorage.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al mount, controlla se c'è già un token valido
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const me = await authApi.getMe();
    setUser(me.data);
    return me.data;
  };

  const logout = async () => {
    try {
      await authApi.logout(localStorage.getItem('refresh_token'));
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const me = await authApi.getMe();
    setUser(me.data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
