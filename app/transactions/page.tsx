'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { Plus, ChevronLeft, ChevronRight, Trash2, Wallet, Pencil, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslation } from '@/hooks/useTranslation';

import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Cargando...</div>}>
      <TransactionsScreen />
    </Suspense>
  );
}

const EMPTY_ARRAY: any[] = [];

function TransactionsScreen() {
  const router = useRouter();
  const { formatCurrency, formatAmount, code } = useCurrency();
  const { t, lang } = useTranslation();
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Modal State
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setType(t.type);
    setAmount(formatAmount(t.amount));
    setCategory(t.category);
    setDescription(t.description || '');
    setDate(t.date);
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['all', 'income', 'expense'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    
    if (searchParams.get('add') === 'true') {
      setIsAddModalOpen(true);
      router.replace('/transactions', { scroll: false });
    }
  }, [searchParams, router]);

  const monthName = currentDate.toLocaleDateString(lang === 'es' ? 'es-AR' : lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', year: 'numeric' });

  const transactions = useLiveQuery(() => 
    db.transactions.toArray()
  ) || EMPTY_ARRAY;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const isSameMonth = d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      const isSameType = activeTab === 'all' || t.type === activeTab;
      return isSameMonth && isSameType;
    }).sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      // If same day, use ID/Created_at (recents first)
      return (b.id || 0) - (a.id || 0);
    });
  }, [transactions, currentDate, activeTab]);

  const income = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
  const expense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
  const balance = income - expense;

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (!acc[t.date]) acc[t.date] = [];
      acc[t.date].push(t);
      return acc;
    }, {} as Record<string, typeof transactions>);
  }, [filteredTransactions]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSaveTransaction = async () => {
    if (!amount || !category || !date) return;
    
    const parsedAmount = parseFloat(amount.replace(/\./g, ''));

    if (editingId) {
      await db.transactions.update(editingId, {
        type,
        amount: parsedAmount,
        category,
        description,
        date
      });
    } else {
      await db.transactions.add({
        type,
        amount: parsedAmount,
        category,
        description,
        date,
        created_at: new Date().toISOString()
      });
    }

    setIsAddModalOpen(false);
    setEditingId(null);
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = async (id?: number) => {
    if (id && confirm('¿Estás seguro de eliminar esta transacción?')) {
      await db.transactions.delete(id);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-12 space-y-8 pb-32 max-w-7xl mx-auto">
      <header className="pt-4 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-surface-alt rounded-full p-1.5 border border-border/50 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 md:p-3 text-text-muted hover:text-text-primary transition-colors">
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
          </button>
          <span suppressHydrationWarning className="font-display font-bold capitalize text-lg md:text-2xl">{monthName}</span>
          <button onClick={handleNextMonth} className="p-2 md:p-3 text-text-muted hover:text-text-primary transition-colors">
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        </div>

        <div className="flex bg-surface-alt rounded-2xl p-1.5 border border-border/50">
          {['all', 'income', 'expense'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 md:py-4 text-sm md:text-base font-semibold rounded-xl transition-all duration-300 ${
                activeTab === tab ? 'bg-surface text-text-primary shadow-lg scale-100' : 'text-text-muted hover:text-text-secondary scale-95'
              }`}
            >
              {tab === 'all' ? (lang === 'en' ? 'All' : lang === 'pt' ? 'Todos' : 'Todos') : 
               tab === 'income' ? t.dashboard.income : t.dashboard.expenses}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface-alt rounded-[2rem] p-6 md:p-8 border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ArrowUpRight className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-text-muted font-medium mb-0.5">{t.dashboard.income}</p>
              <p className="text-xl md:text-2xl font-display font-bold text-primary tracking-tight">{formatCurrency(income)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 md:py-0 border-y md:border-y-0 md:border-x border-border/30 px-0 md:px-6">
            <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center border border-error/20">
              <ArrowDownRight className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-text-muted font-medium mb-0.5">{t.dashboard.expenses}</p>
              <p className="text-xl md:text-2xl font-display font-bold text-error tracking-tight">{formatCurrency(expense)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${balance >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-error/10 border-error/20'}`}>
              <Wallet className={`w-6 h-6 ${balance >= 0 ? 'text-primary' : 'text-error'}`} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-text-muted font-medium mb-0.5">{t.dashboard.net_balance}</p>
              <p className={`text-xl md:text-2xl font-display font-bold tracking-tight ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-4xl mx-auto">
        <AnimatePresence>
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([date, trans]: [string, any]) => (
              <motion.div variants={itemVariants} layout key={date} className="space-y-3">
                <h4 className="text-xs md:text-sm font-semibold text-text-muted uppercase tracking-wider pl-2">
                  {formatRelativeDate(date)}
                </h4>
                <div className="bg-surface/90 rounded-3xl border border-border overflow-hidden shadow-sm">
                  {trans.map((t: any, i: number) => {
                    const cat = (t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find(c => c.id === t.category);
                    const Icon = cat?.icon || Wallet;
                    return (
                      <motion.div layout key={t.id} className={`flex items-center justify-between p-4 md:p-6 ${i !== trans.length - 1 ? 'border-b border-border/50' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border ${t.type === 'income' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                            <Icon className="w-6 h-6 md:w-7 md:h-7" />
                          </div>
                          <div>
                            <p className="text-text-primary font-semibold md:text-lg">{cat?.label || 'Otro'}</p>
                            {t.description && <p className="text-xs md:text-sm text-text-muted mt-0.5">{t.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                          <p className={`font-display font-semibold text-lg md:text-2xl ${t.type === 'income' ? 'text-primary' : 'text-error'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </p>
                          <div className="flex items-center gap-1 md:gap-2">
                            <button onClick={() => handleEdit(t)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                              <Pencil className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-colors">
                              <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center justify-center text-text-muted">
              <div className="w-20 h-20 rounded-full bg-surface-alt flex items-center justify-center mb-4">
                <Wallet className="w-10 h-10 opacity-50" />
              </div>
              <p className="font-medium">No hay transacciones este mes</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>



      <BottomSheet isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingId(null); }} title={editingId ? 'Editar Transacción' : 'Nueva Transacción'}>
        <div className="space-y-6 pb-8">
          <div className="flex bg-surface-alt rounded-xl p-1 border border-border/50">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                type === 'expense' ? 'bg-error text-white shadow-md scale-100' : 'text-text-muted scale-95'
              }`}
            >
              Gasto
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                type === 'income' ? 'bg-primary text-text-inverse shadow-md scale-100' : 'text-text-muted scale-95'
              }`}
            >
              Ingreso
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Monto</label>
            <CurrencyInput value={amount} onChange={setAmount} />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Categoría</label>
            <div className="grid grid-cols-4 gap-3">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                      isSelected 
                        ? (type === 'income' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(0,255,136,0.2)]' : 'bg-error/10 border-error text-error shadow-[0_0_10px_rgba(239,68,68,0.2)]')
                        : 'bg-surface-alt border-border text-text-muted hover:border-text-muted hover:bg-surface-alt/80'
                    }`}
                  >
                    <Icon className={`w-7 h-7 mb-2 ${isSelected ? '' : 'opacity-70'}`} />
                    <span className="text-[10px] font-medium text-center leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
            <label className="block text-xs font-medium text-text-muted mb-2">Descripción (Opcional)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Almuerzo con el equipo"
            />
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveTransaction}
            disabled={!amount || !category}
            className="w-full bg-primary text-text-inverse font-display font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dim transition-colors"
          >
            Guardar
          </motion.button>
        </div>
      </BottomSheet>
    </motion.div>
  );
}
