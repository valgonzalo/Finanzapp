"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
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
      
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Solo mostramos el contenido si no estamos en setup (en setup mostramos solo PinScreen) 
          o si ya estamos desbloqueados */}
      {(authState === 'unlocked' || (authState === 'locked' && localStorage.getItem('pin_configured') === 'true')) && (
        <div className={authState !== 'unlocked' ? 'blur-md pointer-events-none' : 'transition-all duration-500'}>
          {children}
        </div>
      )}
      {/* Si estamos en loading, mostramos nada o un splash */}
      {authState === 'loading' && (
        <div className="fixed inset-0 bg-[#0A0A0A] z-[10000] flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-primary font-display font-bold text-xl tracking-widest uppercase">FinanzApp</h2>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
