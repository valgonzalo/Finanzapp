"use client";

import { motion } from 'framer-motion';
import { SavingsGoal } from '@/lib/db';
import { cn } from '@/lib/utils';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onClick: () => void;
}

export default function SavingsGoalCard({ goal, onClick }: SavingsGoalCardProps) {
  const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  
  const daysRemaining = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.button
      whileHover={{ scale: 1.02, borderColor: goal.color + '40' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-4 transition-all w-full relative overflow-hidden text-center"
    >
      {/* Percentage Badge */}
      <div 
        className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full border"
        style={{ color: goal.color, borderColor: goal.color + '40', backgroundColor: goal.color + '10' }}
      >
        {percentage}%
      </div>

      <div className="text-5xl mt-2 mb-2">{goal.emoji}</div>
      
      <div className="space-y-1 w-full">
        <h3 className="text-white font-bold font-display text-lg truncate px-2">{goal.name}</h3>
        <p className="text-white/40 text-xs font-['Inter']">
          ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
        </p>
      </div>

      <div className="w-full h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full rounded-full"
          style={{ backgroundColor: goal.color }}
        />
      </div>

      {daysRemaining !== null && daysRemaining > 0 && (
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-widest mt-1",
          daysRemaining < 7 ? "text-[#EF4444]" : "text-white/20"
        )}>
          {daysRemaining} días restantes
        </p>
      )}

      {goal.is_completed === 1 && (
        <div className="absolute inset-0 bg-[#00FF8805] pointer-events-none flex items-center justify-center">
          <div className="bg-[#00FF88] text-black text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded rotate-[-12deg] shadow-lg">
            ¡Meta Alcanzada!
          </div>
        </div>
      )}
    </motion.button>
  );
}
