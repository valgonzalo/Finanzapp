"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Repeat, DollarSign, Tag, FileText } from 'lucide-react';
import { db } from '@/lib/db';
import { calculateFirstExecution } from '@/app/utils/recurringTransactions';
import { cn } from '@/lib/utils';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'comida', label: 'Comida', icon: '🍔' },
  { id: 'transporte', label: 'Transporte', icon: '🚗' },
  { id: 'ocio', label: 'Ocio', icon: '🎮' },
  { id: 'salud', label: 'Salud', icon: '💉' },
  { id: 'educacion', label: 'Educación', icon: '📚' },
  { id: 'servicios', label: 'Servicios', icon: '⚡' },
  { id: 'sueldo', label: 'Sueldo', icon: '💰' },
  { id: 'freelance', label: 'Freelance', icon: '💻' },
];

const DAYS_OF_WEEK = [
  { val: 0, label: 'Dom' },
  { val: 1, label: 'Lun' },
  { val: 2, label: 'Mar' },
  { val: 3, label: 'Mié' },
  { val: 4, label: 'Jue' },
  { val: 5, label: 'Vie' },
  { val: 6, label: 'Sáb' },
];

export default function RecurringModal({ isOpen, onClose }: RecurringModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    try {
      const firstExecution = calculateFirstExecution(recurrence, dayOfMonth, dayOfWeek);
      
      await db.recurringTransactions.add({
        type,
        amount: parseFloat(amount),
        category,
        description,
        recurrence,
        day_of_month: recurrence === 'monthly' ? dayOfMonth : undefined,
        day_of_week: recurrence === 'weekly' ? dayOfWeek : undefined,
        is_active: 1,
        next_execution: firstExecution,
        created_at: new Date().toISOString(),
      });

      onClose();
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAmount('');
    setDescription('');
    setRecurrence('monthly');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#0A0A0A] w-full max-w-xl rounded-t-3xl md:rounded-3xl border border-white/10 overflow-hidden relative"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold font-display text-white">Nuevo Recurrente</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={20} className="text-white/50" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Type Switch */}
              <div className="bg-[#111] p-1 rounded-2xl flex gap-1">
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider",
                      type === t 
                        ? t === 'income' ? "bg-[#00FF88] text-black shadow-lg shadow-[#00FF88]/20" : "bg-[#EF4444] text-white" 
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    {t === 'income' ? 'Ingreso' : 'Gasto'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Monto</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <DollarSign size={20} />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl p-4 pl-12 text-2xl font-bold text-white focus:border-[#00FF8840] outline-none transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Categoría</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1",
                        category === cat.id 
                          ? "bg-[#00FF8810] border-[#00FF8840] text-[#00FF88]" 
                          : "bg-[#111] border-transparent text-white/40 hover:bg-white/5"
                      )}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Descripción</label>
                <div className="relative">
                  <div className="absolute left-4 top-4 text-white/40">
                    <FileText size={20} />
                  </div>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl p-4 pl-12 text-white focus:border-[#00FF8840] outline-none transition-all"
                    placeholder="Ej: Pago de Alquiler"
                    required
                  />
                </div>
              </div>

              {/* Recurrence */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Recurrencia</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRecurrence(r)}
                      className={cn(
                        "py-3 rounded-2xl border transition-all text-xs font-bold uppercase",
                        recurrence === r 
                          ? "bg-white/10 border-white/20 text-white" 
                          : "bg-[#111] border-transparent text-white/40 hover:bg-white/5"
                      )}
                    >
                      {r === 'daily' ? 'Diario' : r === 'weekly' ? 'Semanal' : 'Mensual'}
                    </button>
                  ))}
                </div>

                {/* Recurrence Options */}
                <AnimatePresence mode="wait">
                  {recurrence === 'weekly' && (
                    <motion.div
                      key="weekly"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-7 gap-1"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <button
                          key={d.val}
                          type="button"
                          onClick={() => setDayOfWeek(d.val)}
                          className={cn(
                            "py-2 rounded-lg text-[10px] font-bold uppercase border transition-all",
                            dayOfWeek === d.val 
                              ? "bg-[#00FF88] border-[#00FF88] text-black" 
                              : "bg-[#111] border-white/5 text-white/40"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {recurrence === 'monthly' && (
                    <motion.div
                      key="monthly"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-[10px] font-bold text-white/40 ml-2">Día del mes</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={dayOfMonth}
                        onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                        className="w-full bg-[#111] border border-white/5 rounded-xl p-3 text-white outline-none focus:border-[#00FF8840]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-[#00FF88] hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Programar Movimiento'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
