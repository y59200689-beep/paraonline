/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type AmPmState = 'am' | 'pm';

interface AmPmContextProps {
  amPmState: AmPmState;
  setAmPmState: (state: AmPmState) => void;
  toggleAmPmState: () => void;
}

const AmPmContext = createContext<AmPmContextProps | undefined>(undefined);

export const AmPmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [amPmState, setAmPmState] = useState<AmPmState>('am');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ampm_routine_state');
      if (stored === 'am' || stored === 'pm') {
        setAmPmState(stored);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSetState = (state: AmPmState) => {
    setAmPmState(state);
    try {
      localStorage.setItem('ampm_routine_state', state);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAmPmState = () => {
    handleSetState(amPmState === 'am' ? 'pm' : 'am');
  };

  return (
    <AmPmContext.Provider value={{ amPmState, setAmPmState: handleSetState, toggleAmPmState }}>
      {children}
    </AmPmContext.Provider>
  );
};

export const useAmPm = () => {
  const context = useContext(AmPmContext);
  if (!context) {
    throw new Error('useAmPm must be used within an AmPmProvider');
  }
  return context;
};
