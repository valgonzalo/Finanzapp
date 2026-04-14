'use client';

import { useState, useEffect, use } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Trash2, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { CurrencyInput } from '@/components/CurrencyInput';

export default function DebtDetailScreen({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const debtId = parseInt(resolvedParams.id);
  
  const [partialAmount, setPartialAmount] = useState('');
  const [showPartialInput, setShowPartialInput] = useState(false);

  const debt = useLiveQuery(() => db.debts.get(debtId), [debtId]);
  const installments = useLiveQuery(() => db.debt_installments.where('debt_id').equals(debtId).toArray(), [debtId]);

  if (!debt) return <div className="p-8 text-center text-text-muted">Cargando...</div>;

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta deuda?')) {
      await db.debts.delete(debtId);
      router.push('/debts');
    }
  };

  const handleMarkAsPaid = async () => {
    await db.debts.update(debtId, {
      status: 'paid',
      paid_amount: debt.total_amount
    });
  };

  const handlePartialPayment = async () => {
    if (!partialAmount) return;
    const amount = parseFloat(partialAmount.replace(/\./g, ''));
    if (isNaN(amount)) return;
    
    const newPaidAmount = debt.paid_amount + amount;
    
    await db.debts.update(debtId, {
      paid_amount: newPaidAmount,
      status: newPaidAmount >= debt.total_amount ? 'paid' : 'partial'
    });
    
    setPartialAmount('');
    setShowPartialInput(false);
  };

  const handleToggleInstallment = async (instId: number, currentPaid: number, amount: number) => {
    const newPaid = currentPaid === 1 ? 0 : 1;
    await db.debt_installments.update(instId, {
      paid: newPaid,
      paid_date: newPaid === 1 ? new Date().toISOString() : undefined
    });

    // Recalculate total paid
    const updatedInstallments = await db.debt_installments.where('debt_id').equals(debtId).toArray();
    const totalPaid = updatedInstallments.filter(i => i.paid === 1).reduce((acc, i) => acc + i.amount, 0);
    
    await db.debts.update(debtId, {
      paid_amount: totalPaid,
      status: totalPaid >= debt.total_amount ? 'paid' : totalPaid > 0 ? 'partial' : 'pending'
    });
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
      <header className="pt-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="p-2 -ml-2 text-text-primary hover:bg-surface-alt rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <h1 className="text-text-primary text-xl font-display font-semibold flex-1 tracking-tight">Detalle de deuda</h1>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-surface to-surface-alt rounded-3xl border border-border p-8 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-3xl mb-4 border border-primary/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
            {debt.person_name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-text-primary font-display font-semibold text-2xl mb-1">{debt.person_name}</h2>
          <p className="text-text-muted text-sm mb-6">
            {debt.status === 'paid' ? 'Deuda saldada' : `Falta cobrar ${formatCurrency(debt.total_amount - debt.paid_amount)}`}
          </p>
          <div className={`text-5xl font-display font-bold mb-6 tracking-tight ${debt.status === 'paid' ? 'text-primary' : 'text-text-primary'}`}>
            {formatCurrency(debt.total_amount)}
          </div>
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-surface-alt/80 backdrop-blur-md border border-border/50 shadow-sm">
            <span className={`w-2 h-2 rounded-full mr-2 ${
              debt.status === 'paid' ? 'bg-primary shadow-[0_0_8px_rgba(0,255,136,0.5)]' :
              debt.status === 'partial' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' :
              'bg-warning shadow-[0_0_8px_rgba(251,191,36,0.5)]'
            }`} />
            {debt.status === 'paid' ? 'Cobrado' : debt.status === 'partial' ? 'Cobro parcial' : 'Pendiente'}
          </div>
        </motion.div>

        {debt.due_date && (
          <motion.div variants={itemVariants} className="flex items-center gap-4 p-5 bg-surface-alt/80 backdrop-blur-md rounded-2xl border border-border/50">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border">
              <Calendar className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium mb-0.5">Vencimiento</p>
              <p className={`font-semibold ${new Date(debt.due_date) < new Date() && debt.status !== 'paid' ? 'text-error' : 'text-text-primary'}`}>
                {formatDate(debt.due_date)}
              </p>
            </div>
          </motion.div>
        )}

        {debt.notes && (
          <motion.div variants={itemVariants} className="p-5 bg-surface-alt/80 backdrop-blur-md rounded-2xl border border-border/50">
            <p className="text-xs text-text-muted font-medium mb-2">Notas</p>
            <p className="text-sm text-text-primary leading-relaxed">{debt.notes}</p>
          </motion.div>
        )}

        {debt.has_installments === 0 ? (
          debt.status !== 'paid' && (
            <motion.div variants={itemVariants} className="space-y-3">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAsPaid}
                className="w-full bg-primary text-text-inverse font-display font-semibold py-4 rounded-xl hover:bg-primary-dim transition-colors shadow-[0_0_20px_rgba(0,255,136,0.2)]"
              >
                Marcar como cobrada
              </motion.button>
              
              {!showPartialInput ? (
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPartialInput(true)}
                  className="w-full bg-surface-alt text-text-primary font-medium py-4 rounded-xl border border-border/50 hover:bg-surface-alt/80 transition-colors"
                >
                  Cobro parcial
                </motion.button>
              ) : (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                  <div className="flex-1">
                    <CurrencyInput 
                      value={partialAmount}
                      onChange={setPartialAmount}
                    />
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePartialPayment}
                    className="bg-primary text-text-inverse px-6 rounded-xl font-semibold hover:bg-primary-dim transition-colors"
                  >
                    Guardar
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )
        ) : (
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-text-primary font-display font-semibold text-lg">Cuotas</h3>
            <div className="space-y-2">
              {installments?.map((inst) => (
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  key={inst.id}
                  onClick={() => handleToggleInstallment(inst.id!, inst.paid, inst.amount)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    inst.paid === 1 
                      ? 'bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                      : 'bg-surface-alt/80 backdrop-blur-md border-border/50 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {inst.paid === 1 ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-text-muted" />
                    )}
                    <div className="text-left">
                      <p className={`font-semibold ${inst.paid === 1 ? 'text-primary' : 'text-text-primary'}`}>
                        Cuota {inst.installment_number}
                      </p>
                      {inst.paid_date && (
                        <p className="text-xs text-primary/80 mt-0.5">Cobrada el {formatDate(inst.paid_date)}</p>
                      )}
                    </div>
                  </div>
                  <p className={`font-display font-semibold text-lg ${inst.paid === 1 ? 'text-primary' : 'text-text-primary'}`}>
                    {formatCurrency(inst.amount)}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.button 
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 py-4 mt-8 text-error hover:bg-error/10 rounded-xl transition-colors border border-transparent hover:border-error/20"
        >
          <Trash2 className="w-5 h-5" />
          <span className="font-medium">Eliminar deuda</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
