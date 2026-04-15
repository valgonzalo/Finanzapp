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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm md:max-w-md lg:max-w-lg space-y-8 md:space-y-12 text-center z-10"
      >
        <div className="flex justify-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 md:w-24 md:h-24 bg-primary/20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center border border-primary/30 shadow-[0_0_40px_rgba(0,255,136,0.2)]"
          >
            <Wallet className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </motion.div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary tracking-tight leading-tight">
            Bienvenido a <br /><span className="text-primary italic">FinanzApp</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-sm mx-auto leading-relaxed">
            Tu aliado para una gestión financiera <span className="text-text-primary font-semibold">local, simple y privada.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2 max-w-sm mx-auto w-full">
          <div className="text-left space-y-2.5">
            <label htmlFor="name" className="text-xs font-semibold text-text-muted ml-2 uppercase tracking-widest">
              ¿Cómo te llamas?
            </label>
            <input
              autoFocus
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre..."
              className="w-full bg-surface-alt/50 border border-border/50 rounded-2xl p-4 md:p-5 text-lg md:text-xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-xl backdrop-blur-sm"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-primary text-text-inverse font-bold py-4 md:py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(0,255,136,0.15)] disabled:opacity-50 disabled:shadow-none transition-all hover:bg-primary-dim text-lg md:text-xl group"
          >
            {isSubmitting ? 'Guardando...' : 'Comenzar mi viaje'}
            {!isSubmitting && <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />}
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
