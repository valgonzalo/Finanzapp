'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { Plus, Bell, Trash2, ArrowUpRight, ArrowDownRight, Calendar, Clock, RotateCw, Pencil } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslation } from '@/hooks/useTranslation';

import { Suspense } from 'react';

export default function RemindersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Cargando...</div>}>
      <RemindersScreen />
    </Suspense>
  );
}

const getRecurrenceLabel = (recurrence: string, lang: string = 'es') => {
  switch (recurrence) {
    case 'daily': return lang === 'en' ? 'Daily' : lang === 'pt' ? 'Diário' : 'Diario';
    case 'weekly': return lang === 'en' ? 'Weekly' : lang === 'pt' ? 'Semanal' : 'Semanal';
    case 'monthly': return lang === 'en' ? 'Monthly' : lang === 'pt' ? 'Mensal' : 'Mensual';
    default: return lang === 'en' ? 'Once' : lang === 'pt' ? 'Uma vez' : 'Una vez';
  }
};

const EMPTY_ARRAY: any[] = [];

function RemindersScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency, formatAmount } = useCurrency();
  const { t, lang } = useTranslation();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Modal State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [type, setType] = useState<'payment' | 'collection' | 'general'>('general');
  const [hasInstallments, setHasInstallments] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('');
  const [currentInstallment, setCurrentInstallment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  useEffect(() => {
    if (recurrence !== 'monthly') {
      setHasInstallments(false);
    }
  }, [recurrence]);

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description || '');
    setAmount(r.amount ? formatAmount(r.amount) : '');
    setDate(r.date);
    setTime(r.time);
    setRecurrence(r.recurrence);
    setType(r.type);
    setHasInstallments(!!r.total_installments);
    setTotalInstallments(r.total_installments ? String(r.total_installments) : '');
    setCurrentInstallment(r.current_installment ? String(r.current_installment) : '');
    setIsAddModalOpen(true);
  };

  const reminders = useLiveQuery(() => db.reminders.toArray()) || EMPTY_ARRAY;

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && reminders.length > 0) {
      const reminderToEdit = reminders.find(r => r.id === parseInt(editId));
      if (reminderToEdit) {
        handleEdit(reminderToEdit);
        router.replace('/reminders', { scroll: false });
      }
    } else if (searchParams.get('add') === 'true') {
      setIsAddModalOpen(true);
      router.replace('/reminders', { scroll: false });
    }
  }, [searchParams, router, reminders]);

  const activeReminders = useMemo(() => {
    const now = new Date();
    return reminders.filter(r => {
      const reminderDate = new Date(`${r.date}T${r.time}`);
      return r.is_active === 1 && (r.recurrence !== 'once' || reminderDate >= now);
    }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [reminders]);

  const pastReminders = useMemo(() => {
    const now = new Date();
    return reminders.filter(r => {
      const reminderDate = new Date(`${r.date}T${r.time}`);
      return r.is_active === 0 || (r.recurrence === 'once' && reminderDate < now);
    }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  }, [reminders]);

  const displayedReminders = activeTab === 'active' ? activeReminders : pastReminders;

  const handleSaveReminder = async () => {
    if (!title || !date || !time) return;

    // Request notification permission if available
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    const parsedAmount = amount ? parseFloat(amount.replace(/\./g, '')) : undefined;

    if (editingId) {
      await db.reminders.update(editingId, {
        title,
        description,
        amount: parsedAmount,
        date,
        time,
        recurrence,
        type,
        total_installments: hasInstallments && totalInstallments ? parseInt(totalInstallments) : undefined,
        current_installment: hasInstallments && currentInstallment ? parseInt(currentInstallment) : undefined
      });
    } else {
      await db.reminders.add({
        title,
        description,
        amount: parsedAmount,
        date,
        time,
        recurrence,
        type,
        total_installments: hasInstallments && totalInstallments ? parseInt(totalInstallments) : undefined,
        current_installment: hasInstallments && currentInstallment ? parseInt(currentInstallment) : undefined,
        is_active: 1,
        created_at: new Date().toISOString()
      });
    }

    setIsAddModalOpen(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('09:00');
    setRecurrence('once');
    setType('general');
    setHasInstallments(false);
    setTotalInstallments('');
    setCurrentInstallment('');
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    await db.reminders.update(id, { is_active: currentStatus === 1 ? 0 : 1 });
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este recordatorio?')) {
      await db.reminders.delete(id);
    }
  };

  const getProximityColor = (dateStr: string, timeStr: string) => {
    const now = new Date();
    const reminderDate = new Date(`${dateStr}T${timeStr}`);
    const diffDays = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return 'text-error bg-error/10 border border-error/20';
    if (diffDays <= 1) return 'text-error bg-error/10 border border-error/20';
    if (diffDays <= 3) return 'text-warning bg-warning/10 border border-warning/20';
    return 'text-primary bg-primary/10 border border-primary/20';
  };

  const getIconForType = (t?: string) => {
    switch (t) {
      case 'payment': return <ArrowUpRight className="w-5 h-5" />;
      case 'collection': return <ArrowDownRight className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-12 space-y-8 pb-32 max-w-7xl mx-auto">
      <header className="pt-4 space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text-primary text-2xl md:text-5xl font-display font-bold tracking-tight">Recordatorios</h1>
            <p className="text-text-secondary text-sm md:text-lg mt-1 md:mt-2">Que no se te pase nada</p>
          </div>
        </div>

        <div className="flex bg-surface-alt rounded-2xl p-1.5 border border-border/50">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 md:py-4 text-sm md:text-base font-semibold rounded-xl transition-all duration-300 ${
              activeTab === 'active' ? 'bg-surface text-text-primary shadow-lg scale-100' : 'text-text-muted hover:text-text-secondary scale-95'
            }`}
          >
            {lang === 'en' ? 'Active' : lang === 'pt' ? 'Ativos' : 'Activos'}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 md:py-4 text-sm md:text-base font-semibold rounded-xl transition-all duration-300 ${
              activeTab === 'past' ? 'bg-surface text-text-primary shadow-lg scale-100' : 'text-text-muted hover:text-text-secondary scale-95'
            }`}
          >
            {lang === 'en' ? 'Past' : lang === 'pt' ? 'Passados' : 'Pasados'}
          </button>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 max-w-4xl mx-auto">
        <AnimatePresence>
        {displayedReminders.length > 0 ? (
          displayedReminders.map((reminder: any) => (
            <motion.div variants={itemVariants} layout key={reminder.id} className={`bg-surface/90 rounded-3xl border p-6 md:p-8 shadow-sm transition-all ${
              reminder.is_active ? 'border-border hover:border-primary/50' : 'border-border/50 opacity-60'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border ${getProximityColor(reminder.date, reminder.time)}`}>
                    {getIconForType(reminder.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg md:text-2xl truncate flex items-center gap-2 ${reminder.is_active ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                      {reminder.title}
                      {reminder.total_installments && (
                        <span className="text-[10px] md:text-xs font-medium bg-surface-alt text-text-muted px-2 py-0.5 rounded-full border border-border/50 whitespace-nowrap">
                          {reminder.current_installment || 1}/{reminder.total_installments}
                        </span>
                      )}
                    </h3>
                    {reminder.description && (
                      <p className="text-xs md:text-base text-text-muted mt-1">{reminder.description}</p>
                    )}
                    
                    {reminder.total_installments && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] md:text-xs font-medium">
                          <span className="text-text-muted">Progreso de pago</span>
                          <span className={reminder.type === 'payment' ? 'text-error' : 'text-primary'}>
                            {Math.round(((reminder.current_installment || 1) / reminder.total_installments) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 md:h-2 bg-surface-alt rounded-full overflow-hidden border border-border/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((reminder.current_installment || 1) / reminder.total_installments) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${reminder.type === 'payment' ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(0,255,136,0.4)]'}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleActive(reminder.id!, reminder.is_active)}
                  className={`w-12 h-6 md:w-14 md:h-7 rounded-full transition-colors relative shrink-0 ${reminder.is_active === 1 ? 'bg-primary' : 'bg-surface-alt border border-border'}`}
                >
                  <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full bg-white absolute top-1 md:top-1 transition-transform ${reminder.is_active === 1 ? 'translate-x-7 md:translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-text-muted bg-surface-alt px-3 py-1.5 rounded-lg border border-border/50">
                  <Calendar className="w-4 h-4" />
                  <span>{formatRelativeDate(reminder.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-text-muted bg-surface-alt px-3 py-1.5 rounded-lg border border-border/50">
                  <Clock className="w-4 h-4" />
                  <span>{reminder.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-text-muted bg-surface-alt px-3 py-1.5 rounded-lg border border-border/50">
                  <RotateCw className="w-4 h-4" />
                  <span>{getRecurrenceLabel(reminder.recurrence, lang)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-6 pt-6 border-t border-border/50">
                {reminder.amount ? (
                  <p className={`font-display font-bold text-xl md:text-3xl ${reminder.type === 'payment' ? 'text-error' : reminder.type === 'collection' ? 'text-primary' : 'text-text-primary'}`}>
                    {formatCurrency(reminder.amount)}
                  </p>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-1 md:gap-2">
                  <button onClick={() => handleEdit(reminder)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                    <Pencil className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button onClick={() => handleDelete(reminder.id!)} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-colors">
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center justify-center text-text-muted">
            <div className="w-20 h-20 rounded-full bg-surface-alt flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 opacity-50" />
            </div>
            <p className="font-medium">No hay recordatorios {activeTab === 'active' ? 'activos' : 'pasados'}</p>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>



      <BottomSheet isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingId(null); }} title={editingId ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}>
        <div className="space-y-6 pb-8">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Tipo de recordatorio</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setType('payment')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                  type === 'payment' ? 'bg-error/10 border-error text-error shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-surface-alt border-border text-text-muted hover:bg-surface-alt/80'
                }`}
              >
                <ArrowUpRight className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium text-center leading-tight mt-1">Tengo que pagar</span>
              </button>
              <button
                onClick={() => setType('collection')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                  type === 'collection' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(0,255,136,0.2)]' : 'bg-surface-alt border-border text-text-muted hover:bg-surface-alt/80'
                }`}
              >
                <ArrowDownRight className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium text-center leading-tight mt-1">Me tienen que pagar</span>
              </button>
              <button
                onClick={() => setType('general')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                  type === 'general' ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-surface-alt border-border text-text-muted hover:bg-surface-alt/80'
                }`}
              >
                <Bell className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium text-center leading-tight mt-1">General / Tarea</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Título</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder={type === 'payment' ? 'Ej: Suscripción de Netflix' : type === 'collection' ? 'Ej: Reintegro de Expensas' : 'Ej: Revisar presupuesto semanal'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Descripción (Opcional)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Vence el 15 de cada mes"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Monto (Opcional)</label>
            <CurrencyInput value={amount} onChange={setAmount} />
          </div>

          <div className={`grid grid-cols-2 gap-4 ${recurrence === 'daily' ? 'hidden' : ''}`}>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Fecha</label>
              <input 
                suppressHydrationWarning
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Hora</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {recurrence === 'daily' && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Hora</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Repetición</label>
            <div className="flex bg-surface-alt rounded-xl p-1 border border-border/50">
              {[
                { id: 'once', label: 'Una vez' },
                { id: 'daily', label: 'Diario' },
                { id: 'weekly', label: 'Semanal' },
                { id: 'monthly', label: 'Mensual' }
              ] .map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setRecurrence(opt.id as any)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    recurrence === opt.id 
                      ? 'bg-surface text-text-primary shadow-md scale-100' 
                      : 'text-text-muted scale-95'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {(type === 'payment' || type === 'collection') && recurrence === 'monthly' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                type="button"
                onClick={() => setHasInstallments(!hasInstallments)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  hasInstallments ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-surface-alt border-border text-text-muted hover:bg-surface-alt/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RotateCw className={`w-4 h-4 ${hasInstallments ? 'animate-spin-slow' : ''}`} />
                  <span className="text-sm font-semibold">¿Es un pago en cuotas?</span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${hasInstallments ? 'bg-primary' : 'bg-surface border border-border'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${hasInstallments ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </button>

              {hasInstallments && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-2">Cuota actual</label>
                    <input 
                      type="number" 
                      value={currentInstallment}
                      onChange={(e) => setCurrentInstallment(e.target.value)}
                      className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
                      placeholder="Ej: 1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-2">Total cuotas</label>
                    <input 
                      type="number" 
                      value={totalInstallments}
                      onChange={(e) => setTotalInstallments(e.target.value)}
                      className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
                      placeholder="Ej: 12"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveReminder}
            disabled={!title || !date || !time}
            className="w-full bg-primary text-text-inverse font-display font-semibold py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dim transition-colors"
          >
            Guardar Recordatorio
          </motion.button>
        </div>
      </BottomSheet>
    </motion.div>
  );
}
