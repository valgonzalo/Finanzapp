"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClear: () => void;
}

export default function Toast({ message, onClear }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onAnimationComplete={() => {
            setTimeout(onClear, 3000);
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] min-w-[300px]"
        >
          <div className="bg-[#111111] border border-[#00FF8840] rounded-2xl p-4 flex items-center gap-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-[#00FF8810] flex items-center justify-center text-[#00FF88]">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-white font-['Urbanist'] font-semibold">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
