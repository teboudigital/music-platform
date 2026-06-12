import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('guest_token');
          return createGuestSession();
        })
        .finally(() => setLoading(false));
    } else {
      createGuestSession().finally(() => setLoading(false));
    }
  }, []);

  const createGuestSession = async () => {
    try {
      const res = await authApi.createGuest();
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('guest_token', res.data.guest_token);
      const me = await authApi.getMe();
      setUser(me.data);
    } catch {
      // nessuna connessione — rimane non autenticato
    }
  };

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    localStorage.removeItem('guest_token');
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
      localStorage.removeItem('guest_token');
      setUser(null);
      // Crea nuova sessione guest dopo logout
      await createGuestSession();
    }
  };

  const refreshUser = async () => {
    const me = await authApi.getMe();
    setUser(me.data);
  };

  const isGuest = user?.is_guest === true;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isGuest,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
