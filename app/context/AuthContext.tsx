"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { hashPIN } from '@/app/utils/crypto';

type AuthState = 'loading' | 'setup' | 'locked' | 'unlocked';

interface AuthContextType {
  authState: AuthState;
  isUnlocked: boolean;
  unlock: (pin: string) => Promise<boolean>;
  setupPIN: (pin: string) => Promise<void>;
  changePIN: (oldPin: string, newPin: string) => Promise<boolean>;
  lock: () => void;
  resetAttempts: () => void;
  lockoutTime: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    const isConfigured = localStorage.getItem('pin_configured') === 'true';
    if (!isConfigured) {
      setAuthState('unlocked');
    } else {
      setAuthState('locked');
    }
  }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const unlock = async (pin: string) => {
    if (lockoutTime > 0) return false;

    const storedHash = localStorage.getItem('pin_hash');
    const inputHash = await hashPIN(pin);

    if (inputHash === storedHash) {
      setAuthState('unlocked');
      setAttempts(0);
      return true;
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutTime(30);
        setAttempts(0);
      }
      return false;
    }
  };

  const setupPIN = async (pin: string) => {
    const hash = await hashPIN(pin);
    localStorage.setItem('pin_hash', hash);
    localStorage.setItem('pin_configured', 'true');
    setAuthState('unlocked');
  };

  const changePIN = async (oldPin: string, newPin: string) => {
    const storedHash = localStorage.getItem('pin_hash');
    const oldHash = await hashPIN(oldPin);
    
    if (oldHash === storedHash) {
      const newHash = await hashPIN(newPin);
      localStorage.setItem('pin_hash', newHash);
      return true;
    }
    return false;
  };

  const lock = () => {
    if (localStorage.getItem('pin_configured') === 'true') {
      setAuthState('locked');
    }
  };

  const resetAttempts = () => {
    setAttempts(0);
    setLockoutTime(0);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        authState, 
        isUnlocked: authState === 'unlocked', 
        unlock, 
        setupPIN, 
        changePIN,
        lock,
        resetAttempts,
        lockoutTime 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
