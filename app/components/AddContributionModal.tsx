"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Plus, FileText } from 'lucide-react';
import { db, SavingsGoal } from '@/lib/db';

interface AddContributionModalProps {
  goal: SavingsGoal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddContributionModal({ goal, isOpen, onClose, onSuccess }: AddContributionModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      const donation = parseFloat(amount);
      const newTotal = goal.current_amount + donation;

      // Actualizar meta
      await db.savingsGoals.update(goal.id!, {
        current_amount: newTotal,
        is_completed: newTotal >= goal.target_amount ? 1 : 0
      });

      // Agregar registro de aporte
      await db.savingsContributions.add({
        goal_id: goal.id!,
        amount: donation,
        note: note || undefined,
        date: new Date().toISOString().split('T')[0]
      });

      onSuccess();
      onClose();
      setAmount('');
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#111] w-full max-w-sm rounded-[32px] border border-white/10 overflow-hidden relative"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-white">Sumar Ahorro</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={20} className="text-white/50" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Monto a depositar</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <DollarSign size={20} />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pl-12 text-2xl font-bold text-[#00FF88] outline-none focus:border-[#00FF8840] transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nota (Opcional)</label>
                <div className="relative">
                  <div className="absolute left-4 top-4 text-white/40">
                    <FileText size={18} />
                  </div>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-white/20 transition-all text-sm"
                    placeholder="Ej: Regalo de cumple"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00FF88] text-black font-black py-4 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {loading ? 'Procesando...' : 'Confirmar Aporte'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
