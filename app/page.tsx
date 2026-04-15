'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Plus, Wallet, Bell, ChevronRight, ArrowLeftRight, Users, Pencil, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import BottomSheet from '@/components/BottomSheet';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Onboarding from '@/components/Onboarding';

const EMPTY_ARRAY: any[] = [];

export default function Dashboard() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Hola 👋');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const settings = useLiveQuery(() => db.settings.toArray());
  const userSetting = settings?.[0];
  const onboardingCompleted = !!userSetting?.onboardingCompleted;
  const userName = userSetting?.userName || '';

  useEffect(() => {
    const hour = new Date().getHours();
    let baseGreeting = 'Hola';
    
    if (hour < 12) baseGreeting = 'Buenos días';
    else if (hour < 20) baseGreeting = 'Buenas tardes';
    else baseGreeting = 'Buenas noches';

    setGreeting(`${baseGreeting}${userName ? `, ${userName}` : ''} 👋`);
  }, [userName]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const transactions = useLiveQuery(() => 
    db.transactions.toArray()
  ) || EMPTY_ARRAY;

  const currentMonthTransactions = transactions.filter((t: any) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = useMemo(() => currentMonthTransactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0), [currentMonthTransactions]);
  const expense = useMemo(() => currentMonthTransactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0), [currentMonthTransactions]);
  const balance = income - expense;

  const chartData = useMemo(() => {
    const expensesByCategory = currentMonthTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: Record<string, number>, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const translateCategory = (id: string) => {
      const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
      const cat = allCategories.find(c => c.id === id);
      return cat ? cat.label : id.charAt(0).toUpperCase() + id.slice(1);
    };

    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name: translateCategory(name), value }))
      .sort((a, b) => (b.value as number) - (a.value as number));
  }, [currentMonthTransactions]);

  const COLORS = ['#00FF88', '#00CC6A', '#6EE7B7', '#D1FAE5', '#047857', '#FBBF24', '#60A5FA'];

  const chartComponent = useMemo(() => {
    if (chartData.length === 0) {
      return (
        <div className="h-40 flex flex-col items-center justify-center text-text-muted">
          <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-3">
            <Wallet className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">Sin gastos este mes</p>
        </div>
      );
    }

    return (
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
    );
  }, [chartData]);

  const pendingDebts = useLiveQuery(() => 
    db.debts.where('status').notEqual('paid').limit(3).toArray()
  ) || [];

  const totalPendingDebts = pendingDebts.reduce((acc: number, d: any) => acc + (d.total_amount - d.paid_amount), 0);

  const upcomingReminders = useLiveQuery(() => 
    db.reminders.where('is_active').equals(1).limit(3).toArray()
  ) || [];

  const urgentItems = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const overdueReminders = (upcomingReminders as any[]).filter(r => r.date <= today);
    const overdueDebts = (pendingDebts as any[]).filter(d => d.due_date && d.due_date <= today);

    return [
      ...overdueReminders.map(r => ({ 
        id: `r-${r.id}`, 
        title: r.title, 
        date: r.date, 
        type: r.type, // 'payment', 'collection', 'general'
        isOverdue: r.date < today 
      })),
      ...overdueDebts.map(d => ({ 
        id: `d-${d.id}`, 
        title: `Cobrar de ${d.person_name}`, 
        date: d.due_date, 
        type: 'collection',
        isOverdue: d.due_date < today 
      }))
    ].sort((a, b) => a.date.localeCompare(b.date));
  }, [upcomingReminders, pendingDebts]);

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

  if (settings === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <Onboarding onComplete={() => {}} />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 lg:p-12 space-y-8"
    >
      <motion.header variants={itemVariants} className="flex justify-between items-center pt-4 z-10 pb-4">
        <div>
          <h1 suppressHydrationWarning className="text-text-primary text-2xl md:text-4xl font-display font-semibold tracking-tight">{greeting}</h1>
          <p suppressHydrationWarning className="text-text-secondary text-sm md:text-base mt-1">Acá está tu resumen de {monthName}</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center text-text-inverse shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:bg-primary-dim transition-colors"
        >
          <Plus className="w-7 h-7 md:w-9 md:h-9" />
        </motion.button>
      </motion.header>

      {/* Urgent Notices Banner */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
        <div className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 ${urgentItems.length > 0 ? 'bg-error-muted border-error/30' : 'bg-primary-muted border-primary/20'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${urgentItems.length > 0 ? 'bg-error text-white animate-pulse' : 'bg-primary text-text-inverse'}`}>
              {urgentItems.length > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl text-text-primary">
                {urgentItems.length > 0 ? 'Avisos de Vencimiento' : 'Todo al día'}
              </h3>
              <p className="text-text-secondary text-sm md:text-base">
                {urgentItems.length > 0 
                  ? `Tenés ${urgentItems.length} pendiente${urgentItems.length > 1 ? 's' : ''} para hoy o vencido${urgentItems.length > 1 ? 's' : ''}.` 
                  : 'No tenés pagos ni deudas vencidas. ¡Buen trabajo!'}
              </p>
            </div>
          </div>
          {urgentItems.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {urgentItems.slice(0, 3).map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    const id = item.id.split('-')[1];
                    if (item.id.startsWith('d-')) {
                      router.push(`/debts/${id}`);
                    } else {
                      router.push(`/reminders?edit=${id}`);
                    }
                  }}
                  className="bg-surface/50 backdrop-blur-md border border-border/50 px-4 py-2 rounded-2xl flex items-center gap-3 whitespace-nowrap shadow-sm min-w-fit cursor-pointer hover:bg-surface-alt/80 transition-colors group"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    item.type === 'general' ? 'bg-blue-400' : 
                    item.isOverdue ? 'bg-error animate-pulse' : 'bg-warning'
                  }`} />
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-semibold text-text-primary leading-tight group-hover:text-primary transition-colors">{item.title}</span>
                    <span className="text-[10px] text-text-muted mt-0.5">
                      {item.type === 'general' ? 'Aviso' : 'Vencimiento de pago'} • {formatRelativeDate(item.date)}
                    </span>
                  </div>
                </div>
              ))}
              {urgentItems.length > 3 && (
                <div className="bg-surface/50 backdrop-blur-md border border-border/50 px-4 py-2 rounded-2xl flex items-center text-xs md:text-sm font-medium text-text-muted">
                  +{urgentItems.length - 3} más
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Balance Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-surface to-primary/10 rounded-3xl border border-primary/20 p-6 md:p-8 shadow-[0_0_30px_rgba(0,255,136,0.1)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <p className="text-text-secondary text-sm md:text-base mb-2 font-medium">Balance neto</p>
          <h2 className={`text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
            {formatCurrency(balance)}
          </h2>
          {totalPendingDebts > 0 && (
            <div className="flex items-center gap-2 mb-8 -mt-6 bg-warning/10 w-fit px-3 py-1 rounded-full border border-warning/20">
              <p className="text-warning text-[10px] md:text-xs font-bold uppercase tracking-wider">A cobrar: {formatCurrency(totalPendingDebts)}</p>
            </div>
          )}
          <div className="flex gap-8">
            <div 
              onClick={() => router.push('/transactions?tab=income')}
              className="flex items-center gap-4 cursor-pointer group/item"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/20 flex items-center justify-center backdrop-blur-md border border-primary/20 group-hover/item:border-primary group-hover/item:scale-110 transition-all">
                <ArrowUpRight className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium group-hover/item:text-primary transition-colors">Ingresos</p>
                <p className="text-lg md:text-2xl font-semibold text-text-primary">{formatCurrency(income)}</p>
              </div>
            </div>
            <div 
              onClick={() => router.push('/transactions?tab=expense')}
              className="flex items-center gap-4 cursor-pointer group/item"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-error/20 flex items-center justify-center backdrop-blur-md border border-error/20 group-hover/item:border-error group-hover/item:scale-110 transition-all">
                <ArrowDownRight className="w-6 h-6 md:w-7 md:h-7 text-error" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium group-hover/item:text-error transition-colors">Gastos</p>
                <p className="text-lg md:text-2xl font-semibold text-text-primary">{formatCurrency(expense)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart Card */}
        <motion.div variants={itemVariants} className="bg-surface/90 rounded-3xl border border-border p-6 md:p-8 shadow-lg">
          <h3 className="text-text-primary font-display font-semibold mb-4 text-lg md:text-xl">Gastos por categoría</h3>
          <div className="flex-1 min-h-[250px] md:min-h-[300px]">
            {chartComponent}
          </div>
        </motion.div>

        {/* Debts Card */}
        <motion.div variants={itemVariants} className="bg-surface/90 rounded-3xl border border-border p-6 md:p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-text-primary font-display font-semibold text-lg md:text-xl">Me deben</h3>
              <p className="text-warning font-display font-bold text-2xl md:text-3xl mt-1">{formatCurrency(totalPendingDebts)}</p>
            </div>
            <Link href="/debts" className="text-primary text-sm font-medium flex items-center bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
              Ver todas <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
            {pendingDebts.length > 0 ? (
              pendingDebts.map((debt: any) => (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} 
                  key={debt.id} 
                  onClick={() => router.push(`/debts/${debt.id}`)}
                  className="flex justify-between items-center p-4 md:p-5 bg-surface-alt/50 rounded-2xl border border-border/50 hover:border-border transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg md:text-xl border border-primary/20 group-hover:border-primary/40 transition-colors">
                      {debt.person_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold md:text-lg">{debt.person_name}</p>
                      <p className="text-xs md:text-sm text-warning font-medium mt-0.5">Pendiente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-text-primary font-display font-semibold text-lg md:text-xl">
                      {formatCurrency(debt.total_amount - debt.paid_amount)}
                    </p>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-text-muted text-sm md:text-base text-center py-8 bg-surface-alt/30 rounded-2xl border border-dashed border-border">No hay deudas pendientes</motion.p>
            )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Reminders Card */}
        <motion.div variants={itemVariants} className="bg-surface/90 rounded-3xl border border-border p-6 md:p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-text-primary font-display font-semibold text-lg md:text-xl">Esta semana</h3>
            <Link href="/reminders" className="text-primary text-sm font-medium flex items-center bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder: any) => (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} 
                  key={reminder.id} 
                  className="flex justify-between items-center p-3 md:p-3.5 bg-surface-alt/50 rounded-2xl border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-surface flex items-center justify-center border border-border shadow-sm">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold text-sm md:text-base leading-tight">{reminder.title}</p>
                      <p className="text-[10px] md:text-xs text-text-muted font-medium mt-0.5">{formatRelativeDate(reminder.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reminder.amount && (
                      <p className="text-primary font-display font-semibold text-base md:text-lg">
                        {formatCurrency(reminder.amount)}
                      </p>
                    )}
                    <button 
                      onClick={() => router.push(`/reminders?edit=${reminder.id}`)} 
                      className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all hover:scale-110 active:scale-95"
                      title="Editar recordatorio"
                    >
                      <Pencil className="w-4 h-4 md:w-4.5 md:h-4.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-text-muted text-sm md:text-base text-center py-8 bg-surface-alt/30 rounded-2xl border border-dashed border-border">Sin recordatorios esta semana</motion.p>
            )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

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
