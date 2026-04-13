import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fintrack_token'));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('fintrack_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('fintrack_token', newToken);
    localStorage.setItem('fintrack_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    setToken(null);
    setUser(null);
  }, []);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }
      return res;
    },
    [token, logout]
  );

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authFetch, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
