"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, DollarSign, Type, Calendar } from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJIS = ['🎯', '🏠', '✈️', '🎮', '💻', '📱', '🚗', '🎓', '👟', '💍', '🏝️', '🚲'];

const COLORS = [
  { value: '#00FF88', label: 'Verde' },
  { value: '#60A5FA', label: 'Azul' },
  { value: '#FBBF24', label: 'Amarillo' },
  { value: '#F472B6', label: 'Rosa' },
  { value: '#A78BFA', label: 'Violeta' },
  { value: '#34D399', label: 'Turquesa' },
  { value: '#FB923C', label: 'Naranja' },
];

export default function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [targetAmount, setTargetAmount] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    setLoading(true);
    try {
      await db.savingsGoals.add({
        name,
        emoji,
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        color,
        deadline: deadline || undefined,
        notes: notes || undefined,
        is_completed: 0,
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
    setName('');
    setTargetAmount('');
    setDeadline('');
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#0A0A0A] w-full max-w-xl rounded-[32px] border border-white/10 overflow-hidden relative"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display text-white">Nuevo Objetivo</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={24} className="text-white/50" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Name & Emoji */}
              <div className="flex gap-4">
                <div className="bg-[#111] p-4 rounded-3xl border border-white/5 flex items-center justify-center text-4xl w-24 h-24">
                  {emoji}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Nombre de la Meta</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-white/20 transition-all"
                    placeholder="Ej: Nuevo iPhone"
                    required
                  />
                </div>
              </div>

              {/* Emoji Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Seleccionar Icono</label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={cn(
                        "text-2xl p-3 rounded-2xl border transition-all",
                        emoji === e ? "bg-primary/20 border-primary/50 scale-110 shadow-[0_0_15px_rgba(0,255,136,0.2)]" : "bg-white/5 border-transparent hover:bg-white/10"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Monto Objetivo</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">
                    <DollarSign size={24} />
                  </div>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-3xl p-5 pl-14 text-3xl font-bold text-[#00FF88] outline-none focus:border-[#00FF8840] transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Color Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Color del Objetivo</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                        color === c.value ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c.value }}
                    >
                      {color === c.value && <div className="w-2 h-2 bg-black rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Fecha Límite (Opcional)</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">
                    <Calendar size={20} />
                  </div>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl p-4 pl-14 text-white outline-none focus:border-white/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black py-5 rounded-3xl hover:bg-[#00FF88] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
              >
                <Target size={24} />
                {loading ? 'Preparando Bóveda...' : 'Activar Objetivo'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
