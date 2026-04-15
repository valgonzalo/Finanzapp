'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { motion } from 'motion/react';
import { Wallet, ArrowRight } from 'lucide-react';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await db.settings.add({
        userName: name.trim(),
        onboardingCompleted: 1
      });
      onComplete();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen flex flex-col items-center justify-center p-6 bg-background z-[9999] overflow-y-auto">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md md:max-w-xl lg:max-w-2xl space-y-10 md:space-y-16 text-center z-10"
      >
        <div className="flex justify-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-primary/20 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center border border-primary/30 shadow-[0_0_50px_rgba(0,255,136,0.3)]"
          >
            <Wallet className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-primary" />
          </motion.div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-text-primary tracking-tight">
            Bienvenido a <span className="text-primary italic">FinanzApp</span>
          </h1>
          <p className="text-text-secondary text-lg md:text-2xl lg:text-3xl max-w-lg mx-auto leading-relaxed">
            Tu aliado para una gestión financiera <span className="text-text-primary font-semibold">local, simple y privada.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4 max-w-md mx-auto w-full">
          <div className="text-left space-y-3">
            <label htmlFor="name" className="text-sm md:text-base font-semibold text-text-muted ml-2 uppercase tracking-widest">
              ¿Cómo te llamas?
            </label>
            <input
              autoFocus
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre..."
              className="w-full bg-surface-alt/50 border border-border/50 rounded-3xl p-5 md:p-6 text-xl md:text-2xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-2xl backdrop-blur-sm"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-primary text-text-inverse font-bold py-5 md:py-6 rounded-3xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,255,136,0.2)] disabled:opacity-50 disabled:shadow-none transition-all hover:bg-primary-dim text-xl md:text-2xl group"
          >
            {isSubmitting ? 'Guardando...' : 'Comenzar mi viaje'}
            {!isSubmitting && <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />}
          </motion.button>
        </form>

        <div className="pt-8">
          <p className="text-text-muted text-xs md:text-sm font-medium opacity-60 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Tus datos se guardan únicamente en este dispositivo.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
