'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/data';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface SkinDiagnosticResults {
  skinType: string;
  concern: string;
  sunExposure: string;
}

interface FlyToCartTarget {
  image: string;
  clientX: number;
  clientY: number;
  timestamp: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface UiContextProps {
  // Modals & Drawers
  isWishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
  isDiagnosticOpen: boolean;
  setDiagnosticOpen: (open: boolean) => void;
  isScratchCardOpen: boolean;
  setScratchCardOpen: (open: boolean) => void;
  isRoutineBuilderOpen: boolean;
  setRoutineBuilderOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Search & Glossary
  activeGlossaryKey: string;
  setActiveGlossaryKey: (key: string) => void;

  // Boutique category filter
  activeCategory: string;
  setActiveCategory: (category: string) => void;

  // Concern & Ingredient filters
  activeConcern: string;
  setActiveConcern: (concern: string) => void;
  activeIngredient: string;
  setActiveIngredient: (ingredient: string) => void;

  // Cart Jiggle Animation
  cartJiggleTrigger: number;
  triggerCartJiggle: () => void;

  // Fly to Cart Animation
  flyToCartTarget: FlyToCartTarget | null;
  triggerFlyToCart: (image: string, clientX: number, clientY: number) => void;

  // Skin Diagnostic Results
  diagnostic: SkinDiagnosticResults | null;
  setDiagnostic: (results: SkinDiagnosticResults | null) => void;

  // Toast System
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  dismissToast: (id: string) => void;
}

const UiContext = createContext<UiContextProps | undefined>(undefined);

export const UiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWishlistOpen, setWishlistOpen] = useState(false);
  const [isDiagnosticOpen, setDiagnosticOpen] = useState(false);
  const [isScratchCardOpen, setScratchCardOpen] = useState(false);
  const [isRoutineBuilderOpen, setRoutineBuilderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeGlossaryKey, setActiveGlossaryKey] = useState('niacinamide');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeConcern, setActiveConcern] = useState('all');
  const [activeIngredient, setActiveIngredient] = useState('all');

  const [cartJiggleTrigger, setCartJiggleTrigger] = useState(0);
  const [flyToCartTarget, setFlyToCartTarget] = useState<FlyToCartTarget | null>(null);
  const [diagnostic, setDiagnosticState] = useState<SkinDiagnosticResults | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Hydrate diagnostic state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('skin_diagnostic_results');
      if (stored) {
        setDiagnosticState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('LocalStorage hydration failed:', e);
    }
  }, []);

  // Exit-intent & inactivity timer to open scratch card daily reward
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already triggered this session
    const triggered = sessionStorage.getItem('exit_intent_triggered');
    if (triggered) return;

    let inactivityTimer: NodeJS.Timeout;

    const triggerScratchCard = () => {
      setScratchCardOpen(true);
      sessionStorage.setItem('exit_intent_triggered', 'true');
      cleanup();
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(triggerScratchCard, 35000); // 35 seconds of inactivity
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // e.clientY <= 10 indicates leaving the top boundary of the viewport
      if (e.clientY <= 10) {
        triggerScratchCard();
      }
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    
    const setupListeners = () => {
      activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
      });
      document.addEventListener('mouseleave', handleMouseLeave);
    };

    const cleanup = () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };

    setupListeners();
    resetInactivityTimer(); // Start the first inactivity timer

    return cleanup;
  }, []);

  const setDiagnostic = (results: SkinDiagnosticResults | null) => {
    setDiagnosticState(results);
    try {
      if (results) {
        localStorage.setItem('skin_diagnostic_results', JSON.stringify(results));
      } else {
        localStorage.removeItem('skin_diagnostic_results');
      }
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  };

  const triggerCartJiggle = () => {
    setCartJiggleTrigger(prev => prev + 1);
  };

  const triggerFlyToCart = (image: string, clientX: number, clientY: number) => {
    setFlyToCartTarget({ image, clientX, clientY, timestamp: Date.now() });
  };

  // Toast Action Handlers
  const showToast = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <UiContext.Provider
      value={{
        isWishlistOpen,
        setWishlistOpen,
        isDiagnosticOpen,
        setDiagnosticOpen,
        isScratchCardOpen,
        setScratchCardOpen,
        isRoutineBuilderOpen,
        setRoutineBuilderOpen,
        selectedProduct,
        setSelectedProduct,
        activeGlossaryKey,
        setActiveGlossaryKey,
        activeCategory,
        setActiveCategory,
        activeConcern,
        setActiveConcern,
        activeIngredient,
        setActiveIngredient,
        cartJiggleTrigger,
        triggerCartJiggle,
        flyToCartTarget,
        triggerFlyToCart,
        diagnostic,
        setDiagnostic,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </UiContext.Provider>
  );
};

// Sub-components for Toast System
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for the animate-toast-out animation (300ms)
  }, [onClose]);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />;
    }
  };

  const getThemeClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
      case 'error':
        return 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
      case 'warning':
        return 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100';
      case 'info':
      default:
        return 'border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100';
    }
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto transition-all duration-300 w-full ${getThemeClasses()} ${
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      {getIcon()}
      <div className="flex-1 text-sm font-medium leading-5 whitespace-pre-line">{toast.message}</div>
      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; dismissToast: (id: string) => void }> = ({ toasts, dismissToast }) => {
  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[99999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
};
