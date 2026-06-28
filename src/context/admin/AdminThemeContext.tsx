'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminThemeContextProps {
  adminTheme: 'light' | 'dark';
  toggleAdminTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextProps | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>('light');

  // Load theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_theme');
    if (saved === 'light' || saved === 'dark') {
      setAdminTheme(saved);
    }
  }, []);

  const toggleAdminTheme = () => {
    const nextTheme = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(nextTheme);
    localStorage.setItem('admin_theme', nextTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ adminTheme, toggleAdminTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};
