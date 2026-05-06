import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const registerAdmin = async (adminData) => {
    try {
      await authService.register(adminData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasPermission = (module, action) => {
    if (!user) return false;
    
    // SuperAdmin or Admin (with permissions: 'all') has all access
    if (user.role === 'superadmin' || user.role === 'admin' || user.permissions === 'all') {
      return true;
    }
    
    // Check specific module permissions for Employee/User roles
    if (user.permissions && typeof user.permissions === 'object') {
      const modulePerms = user.permissions[module];
      if (Array.isArray(modulePerms)) {
        return modulePerms.includes(action);
      }
    }
    
    return false;
  };

  const hasAnyPermission = (module) => {
    if (!user) return false;
    if (user.role === 'superadmin' || user.role === 'admin' || user.permissions === 'all') {
      return true;
    }
    if (user.permissions && typeof user.permissions === 'object') {
      const modulePerms = user.permissions[module];
      return Array.isArray(modulePerms) && modulePerms.length > 0;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerAdmin, hasPermission, hasAnyPermission, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
