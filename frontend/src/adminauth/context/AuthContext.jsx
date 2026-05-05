import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, getFromStorage, setToStorage, initializeStorage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const savedUser = getFromStorage(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const roles = getFromStorage(STORAGE_KEYS.ROLES) || [];
      const userRole = roles.find(r => r.roleName === foundUser.role);
      const userWithPermissions = { ...foundUser, permissions: userRole?.permissions || {} };
      
      setUser(userWithPermissions);
      setToStorage(STORAGE_KEYS.CURRENT_USER, userWithPermissions);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials or user not found' };
  };

  const registerAdmin = (adminData) => {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    if (users.some(u => u.role === 'Admin')) {
      return { success: false, message: 'Admin already exists' };
    }
    
    const newAdmin = { ...adminData, role: 'Admin', id: Date.now().toString() };
    const updatedUsers = [...users, newAdmin];
    setToStorage(STORAGE_KEYS.USERS, updatedUsers);
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const hasPermission = (module, action) => {
    if (!user || !user.permissions) return false;
    if (user.role === 'Admin') return true;
    return user.permissions[module]?.includes(action);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerAdmin, hasPermission, loading }}>
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
