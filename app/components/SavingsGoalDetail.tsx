"use client";

import { useLiveQuery } from 'dexie-react-hooks';
import { db, SavingsGoal } from '@/lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { useState } from 'react';
import AddContributionModal from './AddContributionModal';

interface SavingsGoalDetailProps {
  goalId: number;
  onClose: () => void;
}

export default function SavingsGoalDetail({ goalId, onClose }: SavingsGoalDetailProps) {
  const goal = useLiveQuery(() => db.savingsGoals.get(goalId), [goalId]);
  const contributions = useLiveQuery(() => 
    db.savingsContributions.where('goal_id').equals(goalId).reverse().toArray(), 
  [goalId]);
  
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (!goal) return null;

  const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));

  const handleDeleteGoal = async () => {
    if (confirm('¿Eliminar este objetivo y todos sus aportes?')) {
      await db.savingsGoals.delete(goalId);
      await db.savingsContributions.where('goal_id').equals(goalId).delete();
      onClose();
    }
  };

  const handleDeleteContribution = async (id: number, amount: number) => {
    if (confirm('¿Eliminar este aporte?')) {
      await db.savingsContributions.delete(id);
      await db.savingsGoals.update(goalId, {
        current_amount: goal.current_amount - amount,
        is_completed: (goal.current_amount - amount) >= goal.target_amount ? 1 : 0
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col pt-safe"
    >
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold font-display text-white">{goal.name}</h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Detalle de Objetivo</p>
        </div>
        <button 
          onClick={handleDeleteGoal}
          className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-500"
        >
          <Trash2 size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 max-w-2xl mx-auto w-full space-y-12">
        {/* Progress Ring Section */}
        <section className="flex flex-col items-center gap-8 py-8">
          <div className="relative flex items-center justify-center">
            <CircularProgress 
              percentage={percentage} 
              size={220} 
              strokeWidth={16} 
              color={goal.color} 
            />
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl mb-2">{goal.emoji}</span>
              <span className="text-4xl font-black font-display text-white">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Ahorrado</p>
              <p className="text-2xl font-black font-display" style={{ color: goal.color }}>
                ${goal.current_amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Objetivo</p>
              <p className="text-2xl font-black font-display text-white/80">
                ${goal.target_amount.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <TrendingUp size={16} /> Historial de Aportes
            </h3>
            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/30 font-bold">
              {contributions?.length || 0} registros
            </span>
          </div>

          <div className="space-y-3">
            {contributions?.map((c) => (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/50">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">+${c.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">{c.date} {c.note ? `• ${c.note}` : ''}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteContribution(c.id!, c.amount)}
                  className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}

            {contributions?.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No hay aportes todavía</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button for Contributions */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6">
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95"
          style={{ backgroundColor: goal.color, color: '#000' }}
        >
          <Plus size={24} />
          Sumar Ahorro
        </button>
      </div>

      <AddContributionModal 
        goal={goal} 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={() => {}} 
      />
    </motion.div>
  );
}
