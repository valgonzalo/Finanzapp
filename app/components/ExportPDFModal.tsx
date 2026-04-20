"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Calendar } from 'lucide-react';
import { generateMonthlyPDF } from '@/app/utils/generatePDF';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTHS = [
  { val: 1, label: 'Enero' }, { val: 2, label: 'Febrero' }, { val: 3, label: 'Marzo' },
  { val: 4, label: 'Abril' }, { val: 5, label: 'Mayo' }, { val: 6, label: 'Junio' },
  { val: 7, label: 'Julio' }, { val: 8, label: 'Agosto' }, { val: 9, label: 'Septiembre' },
  { val: 10, label: 'Octubre' }, { val: 11, label: 'Noviembre' }, { val: 12, label: 'Diciembre' }
];

export default function ExportPDFModal({ isOpen, onClose }: ExportPDFModalProps) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleExport = async () => {
    setLoading(true);
    try {
      await generateMonthlyPDF(month, year);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar el PDF.');
    } finally {
      setLoading(false);
    }
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-[#111] w-full max-w-sm rounded-[32px] border border-white/10 overflow-hidden relative"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <FileText size={20} className="text-[#00FF88]" />
                <h3 className="text-lg font-bold font-display">Exportar Reporte</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                disabled={loading}
              >
                <X size={20} className="text-white/50" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-white/50 leading-relaxed">
                Selecciona el mes y año para generar un reporte PDF premium con el resumen de tus finanzas.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Mes</label>
                  <div className="relative">
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      disabled={loading}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#00FF8840] transition-all appearance-none"
                    >
                      {MONTHS.map(m => (
                        <option key={m.val} value={m.val}>{m.label}</option>
                      ))}
                    </select>
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Año</label>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      disabled={loading}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#00FF8840] transition-all appearance-none"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full bg-[#00FF88] text-black font-black py-4 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Download size={20} />
                  </motion.div>
                ) : (
                  <Download size={20} />
                )}
                {loading ? 'Generando PDF...' : 'Generar PDF'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
