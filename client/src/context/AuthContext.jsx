import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res && res.success && res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // Not logged in or expired token
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setAuthError(null);
    const res = await api.login({ email, password });
    if (res && res.data) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('blog_auth_token', res.data.token);
      }
      return res.data.user;
    }
  }

  async function register(name, email, password) {
    setAuthError(null);
    const res = await api.register({ name, email, password });
    if (res && res.data) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('blog_auth_token', res.data.token);
      }
      return res.data.user;
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('blog_auth_token');
    }
  }

  const value = {
    user,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    refreshUser: checkCurrentUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

