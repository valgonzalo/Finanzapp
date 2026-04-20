"use client";

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PiggyBank, Target, ArrowRight } from 'lucide-react';
import SavingsGoalCard from '@/app/components/SavingsGoalCard';
import AddGoalModal from '@/app/components/AddGoalModal';
import SavingsGoalDetail from '@/app/components/SavingsGoalDetail';

export default function SavingsPage() {
  const goals = useLiveQuery(() => db.savingsGoals.toArray());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const totalSaved = goals?.reduce((acc, goal) => acc + goal.current_amount, 0) || 0;

  return (
    <div className="p-4 md:p-10 lg:p-16 space-y-12 pb-32 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00FF8810] rounded-2xl text-[#00FF88]">
              <PiggyBank size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display text-white">Ahorros</h1>
          </div>
          <p className="text-white/40 text-lg">Construyendo tu libertad financiera paso a paso.</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-6 rounded-[32px] flex items-center gap-6 min-w-[280px]">
          <div className="space-y-1 flex-1">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Total Acumulado</p>
            <p className="text-3xl font-black font-display text-[#00FF88]">
              ${totalSaved.toLocaleString()}
            </p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 bg-[#00FF88] rounded-2xl flex items-center justify-center text-black hover:rotate-90 transition-all duration-500 shadow-lg shadow-[#00FF88]/20"
          >
            <Plus size={32} />
          </button>
        </div>
      </header>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {goals?.map((goal) => (
          <SavingsGoalCard 
            key={goal.id} 
            goal={goal} 
            onClick={() => setSelectedGoalId(goal.id!)} 
          />
        ))}

        <AnimatePresence>
          {(!goals || goals.length === 0) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center gap-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                <Target size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white/50">Todavía no tenés metas</h3>
                <p className="text-white/20 text-sm max-w-xs mx-auto">Creá tu primer objetivo de ahorro para empezar a ver el progreso.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 text-[#00FF88] font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all"
              >
                Crear Objetivo <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddGoalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <AnimatePresence>
        {selectedGoalId && (
          <SavingsGoalDetail 
            goalId={selectedGoalId} 
            onClose={() => setSelectedGoalId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
