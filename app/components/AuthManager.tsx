"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import PinScreen from './PinScreen';
import { processRecurringTransactions } from '@/app/utils/recurringTransactions';
import Toast from './Toast';

export default function AuthManager({ children }: { children: React.ReactNode }) {
  const { authState, lock } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authState === 'unlocked') {
      processRecurringTransactions().then(count => {
        if (count > 0) {
          setToastMessage(`✅ Se registraron ${count} movimiento${count > 1 ? 's' : ''} automático${count > 1 ? 's' : ''}`);
        }
      });
    }
  }, [authState]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem('last_background_time', Date.now().toString());
      } else {
        const lastTime = parseInt(localStorage.getItem('last_background_time') || '0');
        const elapsed = Date.now() - lastTime;
        if (elapsed > 30000) {
          lock();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lock]);

  return (
    <>
      <AnimatePresence mode="wait">
        {(authState === 'setup' || authState === 'locked') && (
          <PinScreen key="pin-screen" />
        )}
      </AnimatePresence>
      
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />

      {/* Solo mostramos el contenido si no estamos en setup (en setup mostramos solo PinScreen) 
          o si ya estamos desbloqueados */}
      {(authState === 'unlocked' || (authState === 'locked' && localStorage.getItem('pin_configured') === 'true')) && (
        <div className={authState !== 'unlocked' ? 'blur-md pointer-events-none' : 'transition-all duration-500'}>
          {children}
        </div>
      )}
      {/* Si estamos en loading, mostramos nada o un splash */}
      {authState === 'loading' && (
        <div className="fixed inset-0 bg-[#0A0A0A] z-[10000]" />
      )}
    </>
  );
}
