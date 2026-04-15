'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { Plus, Users, ChevronRight } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { motion, AnimatePresence } from 'motion/react';
import { CurrencyInput } from '@/components/CurrencyInput';

import { Suspense } from 'react';

export default function DebtsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Cargando...</div>}>
      <DebtsScreen />
    </Suspense>
  );
}

const EMPTY_ARRAY: any[] = [];

function DebtsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Modal State
  const [personName, setPersonName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAddModalOpen(true);
      router.replace('/debts', { scroll: false });
    }
  }, [searchParams, router]);

  const debts = useLiveQuery(() => db.debts.toArray()) || EMPTY_ARRAY;

  const pendingDebts = useMemo(() => debts.filter(d => d.status !== 'paid'), [debts]);
  const paidDebts = useMemo(() => debts.filter(d => d.status === 'paid'), [debts]);

  const totalPending = useMemo(() => pendingDebts.reduce((acc, d) => acc + (d.total_amount - d.paid_amount), 0), [pendingDebts]);

  const displayedDebts = activeTab === 'pending' ? pendingDebts : paidDebts;

  const handleSaveDebt = async () => {
    if (!personName || !totalAmount) return;

    const parsedTotalAmount = parseFloat(totalAmount.replace(/\./g, ''));
    const parsedInstallmentAmount = installmentAmount ? parseFloat(installmentAmount.replace(/\./g, '')) : 0;

    const debtId = await db.debts.add({
      person_name: personName,
      total_amount: parsedTotalAmount,
      paid_amount: 0,
      has_installments: hasInstallments ? 1 : 0,
      installments_count: hasInstallments ? parseInt(installmentsCount) : undefined,
      installment_amount: hasInstallments ? parsedInstallmentAmount : undefined,
      due_date: dueDate || undefined,
      notes,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    if (hasInstallments && installmentsCount && parsedInstallmentAmount) {
      const count = parseInt(installmentsCount);
      const installments = [];
      for (let i = 1; i <= count; i++) {
        installments.push({
          debt_id: debtId,
          installment_number: i,
          amount: parsedInstallmentAmount,
          paid: 0
        });
      }
      await db.debt_installments.bulkAdd(installments);
    }

    setIsAddModalOpen(false);
    setPersonName('');
    setTotalAmount('');
    setHasInstallments(false);
    setInstallmentsCount('');
    setInstallmentAmount('');
    setDueDate('');
    setNotes('');
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6 pb-24">
      <header className="pt-4 space-y-6">
        <div>
          <h1 className="text-text-primary text-2xl font-display font-semibold tracking-tight">Lo que me deben</h1>
          <p className="text-text-secondary text-sm mt-1">Gestioná la plata que te deben</p>
        </div>

        <div className="bg-gradient-to-br from-surface to-warning/10 rounded-3xl border border-warning/20 p-6 shadow-[0_0_30px_rgba(251,191,36,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <p className="text-text-secondary text-sm mb-2 font-medium">Total pendiente a cobrar</p>
          <h2 className="text-5xl font-display font-bold text-warning tracking-tight">
            {formatCurrency(totalPending)}
          </h2>
        </div>

        <div className="flex bg-surface-alt/90 rounded-xl p-1 border border-border/50">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'pending' ? 'bg-surface text-text-primary shadow-md scale-100' : 'text-text-muted hover:text-text-secondary scale-95'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'paid' ? 'bg-surface text-text-primary shadow-md scale-100' : 'text-text-muted hover:text-text-secondary scale-95'
            }`}
          >
            Cobradas
          </button>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
        <AnimatePresence>
        {displayedDebts.length > 0 ? (
          displayedDebts.map(debt => (
            <motion.div variants={itemVariants} layout key={debt.id}>
              <Link href={`/debts/${debt.id}`} className="block">
                <div className="bg-surface/90 rounded-2xl border border-border p-5 hover:border-primary/50 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg border ${
                        debt.status === 'paid' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-warning/10 text-warning border-warning/20'
                      }`}>
                        {debt.person_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-text-primary font-semibold text-lg">{debt.person_name}</p>
                        <p className={`text-xs font-medium mt-0.5 ${
                          debt.status === 'paid' ? 'text-primary' : debt.status === 'partial' ? 'text-blue-400' : 'text-warning'
                        }`}>
                          {debt.status === 'paid' ? 'Cobrado' : debt.status === 'partial' ? 'Cobro parcial' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted" />
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs text-text-muted font-medium mb-1">Total de la deuda</p>
                      <p className="text-text-primary font-display font-semibold text-xl">
                        {formatCurrency(debt.total_amount)}
                      </p>
                    </div>
                    {debt.status !== 'paid' && debt.paid_amount > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-text-muted font-medium mb-1">Falta cobrar</p>
                        <p className="text-warning font-display font-semibold text-lg">
                          {formatCurrency(debt.total_amount - debt.paid_amount)}
                        </p>
                      </div>
                    )}
                  </div>

                  {debt.has_installments === 1 && debt.installments_count && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-text-muted font-medium">Progreso de cuotas</span>
                        <span className="text-primary font-semibold">
                          {Math.round((debt.paid_amount / debt.total_amount) * debt.installments_count)}/{debt.installments_count}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${(debt.paid_amount / debt.total_amount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center justify-center text-text-muted">
            <div className="w-20 h-20 rounded-full bg-surface-alt flex items-center justify-center mb-4">
              <Users className="w-10 h-10 opacity-50" />
            </div>
            <p className="font-medium">No hay deudas {activeTab === 'pending' ? 'pendientes' : 'cobradas'}</p>
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

      <BottomSheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nueva Deuda">
        <div className="space-y-4 pb-8">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Nombre del deudor</label>
            <input 
              type="text" 
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Monto total</label>
            <CurrencyInput 
              value={totalAmount} 
              onChange={(val) => {
                setTotalAmount(val);
                if (hasInstallments && installmentsCount) {
                  const parsedTotal = parseFloat(val.replace(/\./g, ''));
                  if (!isNaN(parsedTotal)) {
                    const instAmount = Math.round(parsedTotal / parseInt(installmentsCount));
                    setInstallmentAmount(new Intl.NumberFormat('es-AR').format(instAmount));
                  }
                }
              }} 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-alt rounded-xl border border-border/50">
            <div>
              <span className="text-sm font-semibold text-text-primary block">¿Tiene cuotas?</span>
              <span className="text-xs text-text-muted mt-0.5 block">Dividir el pago en partes</span>
            </div>
            <button 
              onClick={() => setHasInstallments(!hasInstallments)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${hasInstallments ? 'bg-primary' : 'bg-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hasInstallments ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {hasInstallments && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Cant. Cuotas</label>
                <input 
                  type="number" 
                  value={installmentsCount}
                  onChange={(e) => {
                    setInstallmentsCount(e.target.value);
                    if (totalAmount && e.target.value) {
                      const parsedTotal = parseFloat(totalAmount.replace(/\./g, ''));
                      const instAmount = Math.round(parsedTotal / parseInt(e.target.value));
                      setInstallmentAmount(new Intl.NumberFormat('es-AR').format(instAmount));
                    }
                  }}
                  className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="Ej: 3"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Monto c/u</label>
                <CurrencyInput 
                  value={installmentAmount}
                  onChange={setInstallmentAmount}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Fecha de vencimiento (Opcional)</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Notas (Opcional)</label>
            <input 
              type="text" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Prestamo para el alquiler"
            />
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveDebt}
            disabled={!personName || !totalAmount || (hasInstallments && (!installmentsCount || !installmentAmount))}
            className="w-full bg-primary text-text-inverse font-display font-semibold py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dim transition-colors"
          >
            Guardar Deuda
          </motion.button>
        </div>
      </BottomSheet>
    </motion.div>
  );
}
