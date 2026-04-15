'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wallet, Users, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatBot from './ChatBot';

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actions = [
    { icon: Wallet, color: 'bg-primary', label: 'Transacción', route: '/transactions?add=true' },
    { icon: Users, color: 'bg-warning', label: 'Deuda', route: '/debts?add=true' },
    { icon: Bell, color: 'bg-blue-500', label: 'Recordatorio', route: '/reminders?add=true' },
  ];

  return (
    <>
      <ChatBot />

      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-center gap-4">
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col items-center gap-3 mb-2">
              {actions.map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center group"
                >
                  <span className="mr-3 bg-surface border border-border px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                    {action.label}
                  </span>
                  <button
                    onClick={() => {
                      router.push(action.route);
                      setIsOpen(false);
                    }}
                    className={`w-12 h-12 ${action.color} text-text-inverse rounded-full flex items-center justify-center shadow-lg hover:brightness-110 transition-all border-4 border-background`}
                  >
                    <action.icon className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 ${isOpen ? 'bg-surface-alt rotate-45' : 'bg-primary'} text-background rounded-full shadow-2xl flex items-center justify-center border-4 border-background transition-colors duration-300`}
        >
          {isOpen ? <X className="w-8 h-8 text-text-primary" /> : <Plus className="w-8 h-8" />}
        </motion.button>
      </div>
    </>
  );
}
