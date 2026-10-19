import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('tempel-user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tempel-token') || '');
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('tempel-token', token);
    } else {
      localStorage.removeItem('tempel-token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tempel-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tempel-user');
    }
  }, [user]);

  const login = async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    const nextUser = response.data.user;
    setUser(nextUser);
    setToken(response.data.token);
    setMustChangePassword(Boolean(response.data.mustChangePassword));
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setMustChangePassword(false);
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    setMustChangePassword(false);
    return response.data;
  };

  const value = useMemo(() => ({ user, token, mustChangePassword, login, logout, changePassword }), [user, token, mustChangePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
