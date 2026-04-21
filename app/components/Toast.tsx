"use client";

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onAnimationComplete={() => {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] min-w-[320px] px-4"
        >
          <div className={cn(
            "bg-surface/90 border rounded-2xl p-4 flex items-center gap-4 shadow-2xl backdrop-blur-xl transition-all",
            type === 'success' ? "border-primary/40 shadow-primary/10" : "border-error/40 shadow-error/10"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              type === 'success' ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
            )}>
              {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            
            <p className="text-text-primary font-medium text-sm flex-1">
              {message}
            </p>

            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-full transition-colors text-text-muted"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
