'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: 'owner' | 'logistician' | 'support';
}

export interface AdminAuthContextProps {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  authError: string;
  setAuthError: (err: string) => void;
  handleLogin: (username: string, password: string) => Promise<boolean>;
  handleLogout: () => void;
  requiresMfa: boolean;
  setRequiresMfa: (val: boolean) => void;
  handleVerifyMfa: (code: string) => Promise<boolean>;
  requiresMfaSetup: boolean;
  setRequiresMfaSetup: (val: boolean) => void;
  handleCompleteMfaSetup: (secret: string, code: string) => Promise<boolean>;
  mfaSetupRecoveryCodes: string[] | null;
  completeMfaSetupConfirm: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('admin_user');
      try {
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_authenticated') === 'true';
    }
    return false;
  });
  const [authError, setAuthError] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [requiresMfaSetup, setRequiresMfaSetup] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaSetupRecoveryCodes, setMfaSetupRecoveryCodes] = useState<string[] | null>(null);
  const [tempMfaUser, setTempMfaUser] = useState<AdminUser | null>(null);

  // Helper to log admin actions directly to endpoint
  const logAuthAction = async (action: string, details: string) => {
    try {
      await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details })
      });
    } catch (e) {
      console.error("Failed to write auth audit log:", e);
    }
  };

  // Check session cookie on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/admin/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          sessionStorage.setItem('admin_authenticated', 'true');
          sessionStorage.setItem('admin_user', JSON.stringify(data.user));
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_user');
        }
      } catch (e) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        sessionStorage.removeItem('admin_authenticated');
        sessionStorage.removeItem('admin_user');
      }
    };
    verifySession();
  }, []);

  const handleLogin = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setAuthError('');
    setRequiresMfa(false);
    setTempToken('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        if (data.requiresMfa) {
          setRequiresMfa(true);
          setTempToken(data.tempToken);
          return true;
        }
        if (data.requiresMfaSetup) {
          setRequiresMfaSetup(true);
          setTempToken(data.tempToken);
          return true;
        }
        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          sessionStorage.setItem('admin_authenticated', 'true');
          sessionStorage.setItem('admin_user', JSON.stringify(data.user));
          
          // Log asynchronously
          setTimeout(() => {
            logAuthAction("Connexion", `Utilisateur "${data.user.name}" (${data.user.role}) connecté avec succès.`);
          }, 100);
          return true;
        }
      }
      
      setAuthError(data.error || 'Identifiants invalides.');
      return false;
    } catch (err) {
      setAuthError('Erreur de connexion au serveur.');
      return false;
    }
  };

  const handleVerifyMfa = async (code: string): Promise<boolean> => {
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setRequiresMfa(false);
        setTempToken('');
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_user', JSON.stringify(data.user));
        return true;
      } else {
        setAuthError(data.error || 'Code de vérification incorrect.');
        return false;
      }
    } catch (err) {
      setAuthError('Erreur de connexion au serveur.');
      return false;
    }
  };

  /**
   * Called when a role-enforced operator completes mandatory MFA setup during login.
   * Validates the code, activates MFA in the DB (using the setup endpoint with the temp token),
   * then grants full dashboard access.
   */
  const handleCompleteMfaSetup = async (secret: string, code: string): Promise<boolean> => {
    setAuthError('');
    try {
      // Enable MFA using the regular enable endpoint — session is not yet set so we pass tempToken
      const res = await fetch('/api/admin/auth/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, code, tempToken })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setMfaSetupRecoveryCodes(data.recoveryCodes || []);
        setTempMfaUser(data.user);
        return true;
      }
      setAuthError(data.error || 'Code incorrect. Réessayez.');
      return false;
    } catch (err) {
      setAuthError('Erreur de connexion au serveur.');
      return false;
    }
  };

  const completeMfaSetupConfirm = () => {
    if (!tempMfaUser) return;
    setCurrentUser(tempMfaUser);
    setIsAuthenticated(true);
    setRequiresMfaSetup(false);
    setTempToken('');
    setMfaSetupRecoveryCodes(null);
    setTempMfaUser(null);
    sessionStorage.setItem('admin_authenticated', 'true');
    sessionStorage.setItem('admin_user', JSON.stringify(tempMfaUser));
    setTimeout(() => {
      logAuthAction("Configuration MFA", `MFA activé et session ouverte pour "${tempMfaUser.name}" (${tempMfaUser.role}).`);
    }, 100);
  };

  const handleLogout = async () => {
    await logAuthAction("Déconnexion", "Utilisateur déconnecté.");
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (e) {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    setRequiresMfa(false);
    setRequiresMfaSetup(false);
    setTempToken('');
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      authError,
      setAuthError,
      handleLogin,
      handleLogout,
      requiresMfa,
      setRequiresMfa,
      handleVerifyMfa,
      requiresMfaSetup,
      setRequiresMfaSetup,
      handleCompleteMfaSetup,
      mfaSetupRecoveryCodes,
      completeMfaSetupConfirm
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
