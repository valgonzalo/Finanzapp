'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Plus, Wallet, Bell, ChevronRight, ArrowLeftRight, Users } from 'lucide-react';
import Link from 'next/link';
import BottomSheet from '@/components/BottomSheet';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const router = useRouter();
  const [greeting, setGreeting] = useState(() => {
    if (typeof window === 'undefined') return 'Hola 👋';
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días 👋';
    if (hour < 20) return 'Buenas tardes 👋';
    return 'Buenas noches 👋';
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hour < 12) setGreeting('Buenos días 👋');
    else if (hour < 20) setGreeting('Buenas tardes 👋');
    else setGreeting('Buenas noches 👋');
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const transactions = useLiveQuery(() => 
    db.transactions.toArray()
  ) || [];

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#00FF88', '#00CC6A', '#6EE7B7', '#D1FAE5', '#047857', '#FBBF24', '#60A5FA'];

  const pendingDebts = useLiveQuery(() => 
    db.debts.where('status').notEqual('paid').limit(3).toArray()
  ) || [];

  const totalPendingDebts = pendingDebts.reduce((acc, d) => acc + (d.total_amount - d.paid_amount), 0);

  const upcomingReminders = useLiveQuery(() => 
    db.reminders.where('is_active').equals(1).limit(3).toArray()
  ) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-6"
    >
      <motion.header variants={itemVariants} className="flex justify-between items-start pt-4">
        <div>
          <h1 suppressHydrationWarning className="text-text-primary text-2xl font-display font-semibold tracking-tight">{greeting}</h1>
          <p suppressHydrationWarning className="text-text-secondary text-sm mt-1">Acá está tu resumen de {monthName}</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-text-inverse shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:bg-primary-dim transition-colors"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </motion.header>

      {/* Balance Card */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-surface to-primary/10 rounded-3xl border border-primary/20 p-6 shadow-[0_0_30px_rgba(0,255,136,0.1)] relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <p className="text-text-secondary text-sm mb-2 font-medium">Balance neto</p>
        <h2 className={`text-5xl font-display font-bold mb-6 tracking-tight ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
          {formatCurrency(balance)}
        </h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center backdrop-blur-md border border-primary/20">
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Ingresos</p>
              <p className="text-base font-semibold text-text-primary">{formatCurrency(income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-error/20 flex items-center justify-center backdrop-blur-md border border-error/20">
              <ArrowDownRight className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Gastos</p>
              <p className="text-base font-semibold text-text-primary">{formatCurrency(expense)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Card */}
      <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md rounded-3xl border border-border p-6 shadow-lg">
        <h3 className="text-text-primary font-display font-semibold mb-4 text-lg">Gastos por categoría</h3>
        {chartData.length > 0 ? (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#222222', borderRadius: '12px', padding: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-text-muted">
            <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-3">
              <Wallet className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">Sin gastos este mes</p>
          </div>
        )}
      </motion.div>

      {/* Debts Card */}
      <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md rounded-3xl border border-border p-6 shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-text-primary font-display font-semibold text-lg">Me deben</h3>
            <p className="text-warning font-display font-bold text-xl mt-1">{formatCurrency(totalPendingDebts)}</p>
          </div>
          <Link href="/debts" className="text-primary text-sm font-medium flex items-center bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
            Ver todas <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
          {pendingDebts.length > 0 ? (
            pendingDebts.map(debt => (
              <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} key={debt.id} className="flex justify-between items-center p-4 bg-surface-alt/50 rounded-2xl border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg border border-primary/20">
                    {debt.person_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold">{debt.person_name}</p>
                    <p className="text-xs text-warning font-medium mt-0.5">Pendiente</p>
                  </div>
                </div>
                <p className="text-text-primary font-display font-semibold text-lg">
                  {formatCurrency(debt.total_amount - debt.paid_amount)}
                </p>
              </motion.div>
            ))
          ) : (
            <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-text-muted text-sm text-center py-4 bg-surface-alt/30 rounded-2xl border border-dashed border-border">No hay deudas pendientes</motion.p>
          )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Reminders Card */}
      <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md rounded-3xl border border-border p-6 shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-text-primary font-display font-semibold text-lg">Esta semana</h3>
          <Link href="/reminders" className="text-primary text-sm font-medium flex items-center bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
          {upcomingReminders.length > 0 ? (
            upcomingReminders.map(reminder => (
              <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} key={reminder.id} className="flex justify-between items-center p-4 bg-surface-alt/50 rounded-2xl border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-border shadow-sm">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold">{reminder.title}</p>
                    <p className="text-xs text-text-muted font-medium mt-0.5">{formatRelativeDate(reminder.date)}</p>
                  </div>
                </div>
                {reminder.amount && (
                  <p className="text-primary font-display font-semibold text-lg">
                    {formatCurrency(reminder.amount)}
                  </p>
                )}
              </motion.div>
            ))
          ) : (
            <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-text-muted text-sm text-center py-4 bg-surface-alt/30 rounded-2xl border border-dashed border-border">Sin recordatorios esta semana</motion.p>
          )}
          </AnimatePresence>
        </div>
      </motion.div>

      <BottomSheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="¿Qué querés agregar?">
        <div className="space-y-3">
          <button 
            onClick={() => { setIsAddModalOpen(false); router.push('/transactions?add=true'); }}
            className="w-full flex items-center gap-4 p-5 bg-surface-alt rounded-2xl hover:bg-surface-alt/80 transition-colors border border-border/50"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-text-primary font-semibold text-lg">Transacción</p>
              <p className="text-text-muted text-sm mt-0.5">Ingreso o gasto</p>
            </div>
          </button>
          <button 
            onClick={() => { setIsAddModalOpen(false); router.push('/debts?add=true'); }}
            className="w-full flex items-center gap-4 p-5 bg-surface-alt rounded-2xl hover:bg-surface-alt/80 transition-colors border border-border/50"
          >
            <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center border border-warning/20">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <div className="text-left">
              <p className="text-text-primary font-semibold text-lg">Deuda</p>
              <p className="text-text-muted text-sm mt-0.5">Alguien me debe plata</p>
            </div>
          </button>
          <button 
            onClick={() => { setIsAddModalOpen(false); router.push('/reminders?add=true'); }}
            className="w-full flex items-center gap-4 p-5 bg-surface-alt rounded-2xl hover:bg-surface-alt/80 transition-colors border border-border/50"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-text-primary font-semibold text-lg">Recordatorio</p>
              <p className="text-text-muted text-sm mt-0.5">Aviso de pago o cobro</p>
            </div>
          </button>
        </div>
      </BottomSheet>
    </motion.div>
  );
}
