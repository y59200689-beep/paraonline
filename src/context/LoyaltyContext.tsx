'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { customerAuthErrorMessage, resolveCustomerIdentity } from '@/lib/customer-auth';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import {
  getActiveTier,
  getTierMultiplier,
  getPointsToNextTier,
  calculateEarnedPoints
} from '@/lib/loyalty';

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface PointsTransaction {
  id: string;
  date: string;
  descriptionFr: string;
  descriptionAr: string;
  amount: number; // positive for earning, negative for redemption
}

export interface ClientUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

interface LoyaltyContextProps {
  points: number;
  totalEarned: number;
  tier: LoyaltyTier;
  pointsHistory: PointsTransaction[];
  earnPoints: (amount: number, descFr: string, descAr: string) => void;
  redeemReward: (cost: number, couponCode: string, descFr: string, descAr: string) => boolean;
  tierMultiplier: number;
  pointsToNextTier: number;
  // Auth
  clientUser: ClientUser | null;
  isLoadingAuth: boolean;
  loginClient: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpClient: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateClientPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateClientProfile: (updates: Pick<ClientUser, 'name' | 'phone'>) => Promise<{ success: boolean; error?: string }>;
  logoutClient: () => Promise<void>;
  syncDiaryLogs: (logs: any[]) => Promise<void>;
  syncPlannerDates: (amDates: string[], pmDates: string[]) => Promise<void>;
  fetchDiaryLogs: () => Promise<any[]>;
  fetchPlannerDates: () => Promise<{ amDates: string[]; pmDates: string[] }>;
}

export const LoyaltyContext = createContext<LoyaltyContextProps | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const { settings } = useSettings();

  // Auth states
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const supabaseUser = useRef<User | null>(null);
  const signUpInFlight = useRef(false);

  // Listen to cross-tab BroadcastChannel
  useEffect(() => {
    if (isLoadingAuth || typeof window === 'undefined') return;
    const channel = new BroadcastChannel('ecom_loyalty_channel');
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_LOYALTY') {
        const currentPoints = Number(localStorage.getItem('loyalty_points') || '0');
        if (currentPoints !== payload.points) {
          setPoints(payload.points);
        }
        
        const currentTotal = Number(localStorage.getItem('loyalty_total_earned') || '0');
        if (currentTotal !== payload.totalEarned) {
          setTotalEarned(payload.totalEarned);
        }

        const currentHistoryStr = localStorage.getItem('loyalty_history') || '[]';
        const receivedHistoryStr = JSON.stringify(payload.pointsHistory);
        if (currentHistoryStr !== receivedHistoryStr) {
          setPointsHistory(payload.pointsHistory);
        }
      }
    };
    return () => {
      channel.close();
    };
  }, [isLoadingAuth]);

  // Broadcast local changes
  useEffect(() => {
    if (isLoadingAuth || typeof window === 'undefined') return;
    const channel = new BroadcastChannel('ecom_loyalty_channel');
    channel.postMessage({
      type: 'SYNC_LOYALTY',
      payload: { points, totalEarned, pointsHistory }
    });
    return () => {
      channel.close();
    };
  }, [points, totalEarned, pointsHistory, isLoadingAuth]);

  // ──────────── Supabase Auth Listener ────────────
  useEffect(() => {
    // Hydrate cached user instantly for 0ms initial load
    try {
      const savedUserStr = localStorage.getItem('customer_client_user');
      if (savedUserStr) {
        setClientUser(JSON.parse(savedUserStr));
      }
    } catch (e) {}

    if (!isSupabaseConfigured()) {
      setIsLoadingAuth(false);
      loadFromLocalStorage();
      return;
    }

    // Safety timeout: Guarantee auth loading ends within 300ms max
    const authTimeout = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 300);

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      supabaseUser.current = session?.user ?? null;
      if (session?.user) {
        // Supabase holds an internal auth lock while this callback runs. Do not
        // await database work here or concurrent getSession() calls can hang.
        const user = session.user;
        setClientUser((current) => {
          const identity = resolveCustomerIdentity(user, null, current);
          try { localStorage.setItem('customer_client_user', JSON.stringify(identity)); } catch {}
          return identity;
        });
        setTimeout(() => {
          if (supabaseUser.current?.id === user.id) void fetchAndApplyProfile(user);
        }, 0);
      } else {
        setClientUser(null);
        try { localStorage.removeItem('customer_client_user'); } catch {}
        loadFromLocalStorage();
      }
      setIsLoadingAuth(false);
      clearTimeout(authTimeout);
    });

    // Check current session on mount
    supabase.auth.getSession().then((res: any) => {
      const session = res.data?.session;
      if (!session) {
        supabaseUser.current = null;
        setClientUser(null);
        try { localStorage.removeItem('customer_client_user'); } catch {}
        loadFromLocalStorage();
        setIsLoadingAuth(false);
        clearTimeout(authTimeout);
      }
    }).catch(() => {
      setIsLoadingAuth(false);
      clearTimeout(authTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(authTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ──────────── Local Storage Load (fallback) ────────────
  const loadFromLocalStorage = () => {
    try {
      const savedPoints = localStorage.getItem('loyalty_points');
      const savedTotal = localStorage.getItem('loyalty_total_earned');
      const savedHistory = localStorage.getItem('loyalty_history');

      const localPoints = savedPoints ? Number(savedPoints) : 0;
      const localTotal = savedTotal ? Number(savedTotal) : 0;
      const localHistory = savedHistory ? JSON.parse(savedHistory) : [];

      setPoints(localPoints);
      setTotalEarned(localTotal);
      setPointsHistory(localHistory);

      // Try server loyalty override if possible
      const orders = localStorage.getItem('ordersBM');
      if (orders) {
        try {
          const parsed = JSON.parse(orders);
          if (parsed.length > 0 && parsed[0].phone) {
            const phone = parsed[0].phone;
            fetch(`/api/admin/loyalty?phone=${phone}`)
              .then(res => res.json())
              .then(data => {
                if (data.success && data.loyaltyOverride) {
                  const serverPoints = data.loyaltyOverride.points;
                  if (serverPoints !== localPoints) {
                    setPoints(serverPoints);
                    localStorage.setItem('loyalty_points', String(serverPoints));
                    const newTx = {
                      id: 'override_' + new Date(data.loyaltyOverride.lastUpdated).getTime(),
                      date: data.loyaltyOverride.lastUpdated,
                      descriptionFr: `Mise à jour administrative (${data.loyaltyOverride.reason || 'Ajustement'})`,
                      descriptionAr: `تحديث إداري للرصيد`,
                      amount: serverPoints - localPoints
                    };
                    const cleanHistory = localHistory.filter((h: any) => !h.id.startsWith('override_'));
                    const updatedHistory = [newTx, ...cleanHistory];
                    setPointsHistory(updatedHistory);
                    localStorage.setItem('loyalty_history', JSON.stringify(updatedHistory));
                  }
                }
              }).catch(() => {});
          }
        } catch {}
      }
    } catch (e) {
      console.error('Error loading loyalty data from localStorage:', e);
    }
  };

  // ──────────── Fetch and Apply Profile from Supabase ────────────
  const fetchAndApplyProfile = async (user: User) => {
    // Auth metadata is available immediately after login. Keep it as a fallback
    // when an older customer_profiles row has an empty name or profile loading fails.
    setClientUser((current) => {
      const identity = resolveCustomerIdentity(user, null, current);
      try { localStorage.setItem('customer_client_user', JSON.stringify(identity)); } catch {}
      return identity;
    });

    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile not yet created — create it
        const { error: insertError } = await supabase.from('customer_profiles').insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name ?? null,
          phone: user.user_metadata?.phone ?? null,
          diary_logs: [],
          planner_am_dates: [],
          planner_pm_dates: [],
        });
        if (insertError) throw insertError;

        const newUser = resolveCustomerIdentity(user);
        setClientUser(newUser);
        try { localStorage.setItem('customer_client_user', JSON.stringify(newUser)); } catch {}
        setPoints(0);
        setTotalEarned(0);
        setPointsHistory([]);
        return;
      }

      if (data) {
        setClientUser((current) => {
          const identity = resolveCustomerIdentity(user, data, current);
          try { localStorage.setItem('customer_client_user', JSON.stringify(identity)); } catch {}
          return identity;
        });
        setPoints(data.points ?? 0);
        setTotalEarned(data.total_earned ?? 0);
        setPointsHistory(data.points_history ?? []);

        // Mirror to localStorage as backup
        localStorage.setItem('loyalty_points', String(data.points ?? 0));
        localStorage.setItem('loyalty_total_earned', String(data.total_earned ?? 0));
        localStorage.setItem('loyalty_history', JSON.stringify(data.points_history ?? []));
      }
    } catch (e) {
      console.error('Error fetching customer profile from Supabase:', e);
      loadFromLocalStorage();
    }
  };

  // ──────────── Persist local loyalty state ────────────
  // The database treats balances as server-controlled data. Browser code must
  // never overwrite a points balance or transaction history directly.
  const saveToStorage = async (newPoints: number, newTotal: number, newHistory: PointsTransaction[]) => {
    try {
      localStorage.setItem('loyalty_points', String(newPoints));
      localStorage.setItem('loyalty_total_earned', String(newTotal));
      localStorage.setItem('loyalty_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving loyalty data to localStorage:', e);
    }

  };

  // ──────────── Auth Functions ────────────
  const loginClient = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: customerAuthErrorMessage(error.message) };
      if (data.user) await fetchAndApplyProfile(data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: customerAuthErrorMessage(e.message || 'Login failed.') };
    }
  };

  const signUpClient = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured.' };
    }
    if (signUpInFlight.current) {
      return { success: false, error: 'La création du compte est déjà en cours.' };
    }

    signUpInFlight.current = true;
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = name.trim();
      const normalizedPhone = phone.trim();
      const siteUrl = typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_SITE_URL
        : window.location.origin;
      const emailRedirectTo = `${(siteUrl || 'https://paraonline-weld.vercel.app').replace(/\/$/, '')}/customer`;
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo,
          data: { name: normalizedName, phone: normalizedPhone },
        },
      });
      if (error) return { success: false, error: customerAuthErrorMessage(error.message) };

      if (!data.user) {
        return { success: false, error: 'Impossible de créer le compte. Veuillez réessayer.' };
      }

      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'Cette adresse email possède déjà un compte. Utilisez plutôt « Se connecter ».',
        };
      }

      if (data.session) {
        supabaseUser.current = data.user;
        await fetchAndApplyProfile(data.user);
      }

      return { success: true, emailConfirmationRequired: !data.session };
    } catch (e: any) {
      return { success: false, error: customerAuthErrorMessage(e.message || 'Sign-up failed.') };
    } finally {
      signUpInFlight.current = false;
    }
  };

  const logoutClient = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setClientUser(null);
    supabaseUser.current = null;
    // Load anonymous local data after logout
    loadFromLocalStorage();
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Le service de connexion est momentanément indisponible.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return { success: false, error: 'Saisissez votre adresse email.' };

    try {
      const siteUrl = typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_SITE_URL
        : window.location.origin;
      const redirectTo = `${(siteUrl || 'https://paraonline-weld.vercel.app').replace(/\/$/, '')}/customer?recovery=1`;
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      if (error) return { success: false, error: customerAuthErrorMessage(error.message) };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: customerAuthErrorMessage(error?.message || 'Reset failed.') };
    }
  };

  const updateClientPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Le service de connexion est momentanément indisponible.' };
    }
    if (password.length < 8) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: customerAuthErrorMessage(error.message) };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: customerAuthErrorMessage(error?.message || 'Password update failed.') };
    }
  };

  const updateClientProfile = async (updates: Pick<ClientUser, 'name' | 'phone'>) => {
    if (!clientUser || !isSupabaseConfigured()) {
      return { success: false, error: 'Votre session a expiré. Veuillez vous reconnecter.' };
    }

    const name = updates.name?.trim() || undefined;
    const phone = updates.phone?.trim() || undefined;

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { name, phone },
      });
      if (authError) return { success: false, error: customerAuthErrorMessage(authError.message) };

      const { error: profileError } = await supabase
        .from('customer_profiles')
        .update({ name: name ?? null, phone: phone ?? null, updated_at: new Date().toISOString() })
        .eq('id', clientUser.id);
      if (profileError) return { success: false, error: profileError.message };

      const updatedUser = { ...clientUser, name, phone };
      setClientUser(updatedUser);
      try { localStorage.setItem('customer_client_user', JSON.stringify(updatedUser)); } catch {}
      return { success: true };
    } catch (error: any) {
      return { success: false, error: customerAuthErrorMessage(error?.message || 'Impossible de mettre à jour le profil.') };
    }
  };

  // ──────────── Diary & Planner Sync ────────────
  const syncDiaryLogs = async (logs: any[]) => {
    localStorage.setItem('skin_diary_logs', JSON.stringify(logs));
    if (isSupabaseConfigured() && supabaseUser.current) {
      try {
        await supabase
          .from('customer_profiles')
          .update({ diary_logs: logs, updated_at: new Date().toISOString() })
          .eq('id', supabaseUser.current.id);
      } catch (e) {
        console.error('Error syncing diary logs to Supabase:', e);
      }
    }
  };

  const syncPlannerDates = async (amDates: string[], pmDates: string[]) => {
    localStorage.setItem('skincare_planner_am_dates', JSON.stringify(amDates));
    localStorage.setItem('skincare_planner_pm_dates', JSON.stringify(pmDates));
    if (isSupabaseConfigured() && supabaseUser.current) {
      try {
        await supabase
          .from('customer_profiles')
          .update({
            planner_am_dates: amDates,
            planner_pm_dates: pmDates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseUser.current.id);
      } catch (e) {
        console.error('Error syncing planner dates to Supabase:', e);
      }
    }
  };

  const fetchDiaryLogs = async (): Promise<any[]> => {
    if (isSupabaseConfigured() && supabaseUser.current) {
      try {
        const { data } = await supabase
          .from('customer_profiles')
          .select('diary_logs')
          .eq('id', supabaseUser.current.id)
          .single();
        if (data?.diary_logs) return data.diary_logs;
      } catch {}
    }
    try {
      const saved = localStorage.getItem('skin_diary_logs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  };

  const fetchPlannerDates = async (): Promise<{ amDates: string[]; pmDates: string[] }> => {
    if (isSupabaseConfigured() && supabaseUser.current) {
      try {
        const { data } = await supabase
          .from('customer_profiles')
          .select('planner_am_dates, planner_pm_dates')
          .eq('id', supabaseUser.current.id)
          .single();
        if (data) {
          return {
            amDates: data.planner_am_dates ?? [],
            pmDates: data.planner_pm_dates ?? [],
          };
        }
      } catch {}
    }
    try {
      const am = localStorage.getItem('skincare_planner_am_dates');
      const pm = localStorage.getItem('skincare_planner_pm_dates');
      return {
        amDates: am ? JSON.parse(am) : [],
        pmDates: pm ? JSON.parse(pm) : [],
      };
    } catch { return { amDates: [], pmDates: [] }; }
  };

  // ──────────── Tier & Multiplier Logic ────────────
  const tier = getActiveTier(totalEarned);
  const tierMultiplier = getTierMultiplier(tier, settings);
  const pointsToNextTier = getPointsToNextTier(totalEarned);

  // ──────────── Earn & Redeem Logic ────────────
  const earnPoints = (amount: number, descFr: string, descAr: string) => {
    const pointsPerDh = settings.loyaltyPointsPerDh !== undefined ? settings.loyaltyPointsPerDh : 1.0;
    const multipliedAmount = calculateEarnedPoints(amount, pointsPerDh, tierMultiplier);
    const updatedPoints = points + multipliedAmount;
    const updatedTotal = totalEarned + multipliedAmount;

    const newTransaction: PointsTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      descriptionFr: descFr,
      descriptionAr: descAr,
      amount: multipliedAmount,
    };

    const updatedHistory = [newTransaction, ...pointsHistory];

    setPoints(updatedPoints);
    setTotalEarned(updatedTotal);
    setPointsHistory(updatedHistory);

    saveToStorage(updatedPoints, updatedTotal, updatedHistory);
  };

  const redeemReward = (cost: number, couponCode: string, descFr: string, descAr: string): boolean => {
    if (points < cost) return false;

    const updatedPoints = points - cost;
    const newTransaction: PointsTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      descriptionFr: `${descFr} (Code: ${couponCode})`,
      descriptionAr: `${descAr} (كود: ${couponCode})`,
      amount: -cost,
    };

    const updatedHistory = [newTransaction, ...pointsHistory];

    setPoints(updatedPoints);
    setPointsHistory(updatedHistory);

    saveToStorage(updatedPoints, totalEarned, updatedHistory);

    return true;
  };

  return (
    <LoyaltyContext.Provider
      value={{
        points,
        totalEarned,
        tier,
        pointsHistory,
        earnPoints,
        redeemReward,
        tierMultiplier,
        pointsToNextTier,
        clientUser,
        isLoadingAuth,
        loginClient,
        signUpClient,
        requestPasswordReset,
        updateClientPassword,
        updateClientProfile,
        logoutClient,
        syncDiaryLogs,
        syncPlannerDates,
        fetchDiaryLogs,
        fetchPlannerDates,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};
