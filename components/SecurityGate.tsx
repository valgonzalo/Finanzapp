'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Fingerprint, Delete, ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function SecurityGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const settings = useLiveQuery(() => db.settings.toArray());
  const userSettings = settings?.[0];
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      // Check if biometrics are available
      (window.PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available: boolean) => setBiometricsAvailable(available));
    }
  }, []);

  // Check if security is even enabled
  useEffect(() => {
    if (userSettings && !userSettings.isSecurityEnabled) {
      setIsUnlocked(true);
    }
  }, [userSettings]);

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === userSettings?.pin) {
          setIsUnlocked(true);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleBiometrics = async () => {
    // This is a simplified demo of how you'd trigger biometrics in a real PWA/Secure context
    // In a real browser, this would use WebAuthn credentials previously created
    alert(t.security.biometrics);
    // For now, we rely on PIN or let the user try their system's biometric if implemented
  };

  const handleReset = async () => {
    if (confirm(t.security.forgot_pin_notice)) {
      await db.delete();
      window.location.reload();
    }
  };

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 touch-none select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto border border-border/50 shadow-xl">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary pt-4">{t.security.enter_pin}</h2>
          <p className="text-text-secondary text-sm">{userSettings?.userName}</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length >= i 
                  ? 'bg-primary border-primary shadow-[0_0_10px_rgba(0,255,136,0.5)]' 
                  : 'border-border'
              } ${error ? 'border-error bg-error' : ''}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePinInput(num.toString())}
              className="w-16 h-16 rounded-full bg-surface-alt border border-border/50 text-xl font-bold text-text-primary flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
            >
              {num}
            </motion.button>
          ))}
          <div className="w-16 h-16" /> {/* Empty space */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePinInput('0')}
            className="w-16 h-16 rounded-full bg-surface-alt border border-border/50 text-xl font-bold text-text-primary flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPin(pin.slice(0, -1))}
            className="w-16 h-16 flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <Delete className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Biometrics - Universal Position */}
        <div className="mt-12 mb-8">
          {biometricsAvailable && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleBiometrics}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all shadow-[0_0_30px_rgba(0,255,136,0.1)]">
                <Fingerprint className="w-10 h-10" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                {lang === 'es' ? 'Tocar para escanear' : 'Tap to scan'}
              </span>
            </motion.button>
          )}
        </div>

        {/* Forgot PIN */}
        <button 
          onClick={handleReset}
          className="text-text-muted text-xs hover:text-error transition-colors mt-4"
        >
          {t.security.forgot_pin}
        </button>
      </motion.div>
    </div>
  );
}
