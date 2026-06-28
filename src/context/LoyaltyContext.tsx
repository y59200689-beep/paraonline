'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext';
import { supabase } from '@/lib/supabase';
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
  signUpClient: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logoutClient: () => Promise<void>;
  syncDiaryLogs: (logs: any[]) => Promise<void>;
  syncPlannerDates: (amDates: string[], pmDates: string[]) => Promise<void>;
  fetchDiaryLogs: () => Promise<any[]>;
  fetchPlannerDates: () => Promise<{ amDates: string[]; pmDates: string[] }>;
}

const LoyaltyContext = createContext<LoyaltyContextProps | undefined>(undefined);

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    url &&
    url !== 'https://placeholder.supabase.co' &&
    url !== 'https://your-project-id.supabase.co' &&
    key &&
    key !== 'placeholder-key' &&
    key !== 'your-public-anon-key-placeholder'
  );
}

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const { settings } = useSettings();

  // Auth states
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const supabaseUser = useRef<User | null>(null);

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
    if (!isSupabaseConfigured()) {
      setIsLoadingAuth(false);
      loadFromLocalStorage();
      return;
    }

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      supabaseUser.current = session?.user ?? null;
      if (session?.user) {
        await fetchAndApplyProfile(session.user);
      } else {
        setClientUser(null);
        loadFromLocalStorage();
      }
      setIsLoadingAuth(false);
    });

    // Check current session on mount
    supabase.auth.getSession().then((res: any) => {
      const session = res.data?.session;
      if (!session) {
        supabaseUser.current = null;
        loadFromLocalStorage();
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
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
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile not yet created — create it
        await supabase.from('customer_profiles').insert({
          id: user.id,
          email: user.email,
          points: 0,
          total_earned: 0,
          points_history: [],
          diary_logs: [],
          planner_am_dates: [],
          planner_pm_dates: [],
        });
        setClientUser({ id: user.id, email: user.email ?? '' });
        setPoints(0);
        setTotalEarned(0);
        setPointsHistory([]);
        return;
      }

      if (data) {
        setClientUser({
          id: user.id,
          email: data.email ?? user.email ?? '',
          name: data.name ?? undefined,
          phone: data.phone ?? undefined,
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

  // ──────────── Persist to both Supabase & localStorage ────────────
  const saveToStorage = async (newPoints: number, newTotal: number, newHistory: PointsTransaction[]) => {
    try {
      localStorage.setItem('loyalty_points', String(newPoints));
      localStorage.setItem('loyalty_total_earned', String(newTotal));
      localStorage.setItem('loyalty_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving loyalty data to localStorage:', e);
    }

    if (isSupabaseConfigured() && supabaseUser.current) {
      try {
        await supabase
          .from('customer_profiles')
          .update({
            points: newPoints,
            total_earned: newTotal,
            points_history: newHistory,
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseUser.current.id);
      } catch (e) {
        console.error('Error saving loyalty data to Supabase:', e);
      }
    }
  };

  // ──────────── Auth Functions ────────────
  const loginClient = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) await fetchAndApplyProfile(data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed.' };
    }
  };

  const signUpClient = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { success: false, error: error.message };

      if (data.user) {
        // Upsert profile with personal info
        await supabase.from('customer_profiles').upsert({
          id: data.user.id,
          email,
          name,
          phone,
          points: 0,
          total_earned: 0,
          points_history: [],
          diary_logs: [],
          planner_am_dates: [],
          planner_pm_dates: [],
        });
        setClientUser({ id: data.user.id, email, name, phone });
        supabaseUser.current = data.user;
        setPoints(0);
        setTotalEarned(0);
        setPointsHistory([]);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Sign-up failed.' };
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
