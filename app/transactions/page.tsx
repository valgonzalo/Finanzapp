'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { Plus, ChevronLeft, ChevronRight, Trash2, Wallet } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { CurrencyInput } from '@/components/CurrencyInput';

import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Cargando...</div>}>
      <TransactionsScreen />
    </Suspense>
  );
}

function TransactionsScreen() {
  const router = useRouter();
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

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAddModalOpen(true);
      // Remove query param without refreshing
      router.replace('/transactions', { scroll: false });
    }
  }, [searchParams, router]);

  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const transactions = useLiveQuery(() => 
    db.transactions.toArray()
  ) || [];

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const isSameMonth = d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    const isSameType = activeTab === 'all' || t.type === activeTab;
    return isSameMonth && isSameType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSaveTransaction = async () => {
    if (!amount || !category || !date) return;
    
    const parsedAmount = parseFloat(amount.replace(/\./g, ''));

    await db.transactions.add({
      type,
      amount: parsedAmount,
      category,
      description,
      date,
      created_at: new Date().toISOString()
    });

    setIsAddModalOpen(false);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6 pb-24">
      <header className="pt-4 space-y-4">
        <div className="flex justify-between items-center bg-surface-alt/80 backdrop-blur-md rounded-full p-1 border border-border/50">
          <button onClick={handlePrevMonth} className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span suppressHydrationWarning className="font-display font-semibold capitalize text-lg">{monthName}</span>
          <button onClick={handleNextMonth} className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-surface-alt/80 backdrop-blur-md rounded-xl p-1 border border-border/50">
          {['all', 'income', 'expense'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === tab ? 'bg-surface text-text-primary shadow-md scale-100' : 'text-text-muted hover:text-text-secondary scale-95'
              }`}
            >
              {tab === 'all' ? 'Todos' : tab === 'income' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-border shadow-lg">
          <div>
            <p className="text-xs text-text-muted font-medium">Ingresos</p>
            <p className="text-primary font-semibold text-lg">{formatCurrency(income)}</p>
          </div>
          <div className="w-px h-10 bg-border/50"></div>
          <div>
            <p className="text-xs text-text-muted font-medium">Gastos</p>
            <p className="text-error font-semibold text-lg">{formatCurrency(expense)}</p>
          </div>
          <div className="w-px h-10 bg-border/50"></div>
          <div>
            <p className="text-xs text-text-muted font-medium">Neto</p>
            <p className={`font-semibold text-lg ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <AnimatePresence>
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([date, trans]) => (
              <motion.div variants={itemVariants} layout key={date} className="space-y-3">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-2">
                  {formatRelativeDate(date)}
                </h4>
                <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border overflow-hidden shadow-sm">
                  {trans.map((t, i) => {
                    const cat = (t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find(c => c.id === t.category);
                    const Icon = cat?.icon || Wallet;
                    return (
                      <motion.div layout key={t.id} className={`flex items-center justify-between p-4 ${i !== trans.length - 1 ? 'border-b border-border/50' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${t.type === 'income' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-text-primary font-semibold">{cat?.label || 'Otro'}</p>
                            {t.description && <p className="text-xs text-text-muted mt-0.5">{t.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={`font-display font-semibold text-lg ${t.type === 'income' ? 'text-primary' : 'text-text-primary'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </p>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-text-inverse shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:bg-primary-dim transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <BottomSheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nueva Transacción">
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
              placeholder="Ej: Supermercado"
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
