"use client";

import { useLiveQuery } from 'dexie-react-hooks';
import { db, RecurringTransaction } from '@/lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Calendar, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RecurringList() {
  const recurring = useLiveQuery(() => db.recurringTransactions.toArray());

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este movimiento recurrente?')) {
      await db.recurringTransactions.delete(id);
    }
  };

  const handleToggle = async (rec: RecurringTransaction) => {
    await db.recurringTransactions.update(rec.id!, {
      is_active: rec.is_active === 1 ? 0 : 1
    });
  };

  if (!recurring || recurring.length === 0) {
    return (
      <div className="bg-[#111] rounded-3xl p-12 text-center border border-white/5">
        <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No hay movimientos programados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {recurring.map((rec) => (
          <motion.div
            key={rec.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] rounded-3xl p-5 border border-white/5 flex items-center gap-4 group"
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-xl",
              rec.type === 'income' ? "bg-[#00FF8810] text-[#00FF88]" : "bg-[#EF444410] text-[#EF4444]"
            )}>
              {rec.type === 'income' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
            </div>

            <div className="flex-1">
              <h4 className="text-white font-bold font-display">{rec.description}</h4>
              <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-wider mt-1">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {rec.recurrence === 'daily' ? 'Diario' : rec.recurrence === 'weekly' ? 'Semanal' : 'Mensual'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Prox: {rec.next_execution}
                </span>
              </div>
            </div>

            <div className="text-right flex items-center gap-4">
              <div>
                <p className={cn(
                  "font-bold font-display text-lg",
                  rec.type === 'income' ? "text-[#00FF88]" : "text-[#EF4444]"
                )}>
                  {rec.type === 'income' ? '+' : '-'}${rec.amount.toLocaleString()}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggle(rec)}
                className={cn(
                  "w-10 h-5 rounded-full p-1 transition-all duration-300 relative",
                  rec.is_active === 1 ? "bg-[#00FF88]" : "bg-white/10"
                )}
              >
                <div size-4 className={cn(
                  "w-3 h-3 bg-white rounded-full transition-all duration-300",
                  rec.is_active === 1 ? "translate-x-5" : "translate-x-0"
                )} />
              </button>

              <button
                onClick={() => handleDelete(rec.id!)}
                className="p-2 rounded-xl bg-white/5 text-white/20 hover:text-[#EF4444] hover:bg-[#EF444410] transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
