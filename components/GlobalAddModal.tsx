'use client';

import { Wallet, Users, Bell, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import BottomSheet from './BottomSheet';

interface GlobalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalAddModal({ isOpen, onClose }: GlobalAddModalProps) {
  const router = useRouter();

  const options = [
    { 
      id: 'transaction', 
      label: 'Transacción', 
      description: 'Gastos o ingresos diarios',
      icon: Wallet, 
      color: 'bg-primary', 
      route: '/transactions?add=true' 
    },
    { 
      id: 'debt', 
      label: 'Deuda', 
      description: 'Préstamos o dinero que te deben',
      icon: Users, 
      color: 'bg-warning', 
      route: '/debts?add=true' 
    },
    { 
      id: 'reminder', 
      label: 'Recordatorio', 
      description: 'Vencimientos y avisos importantes',
      icon: Bell, 
      color: 'bg-blue-500', 
      route: '/reminders?add=true' 
    },
  ];

  const handleSelect = (route: string) => {
    router.push(route);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="¿Qué querés registrar?">
      <div className="space-y-4 pb-8">
        {options.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option.route)}
            className="w-full flex items-center gap-5 p-5 rounded-[2.5rem] bg-surface-alt border border-border/50 hover:border-primary/50 transition-all text-left group"
          >
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${option.color} flex items-center justify-center text-text-inverse shadow-lg shrink-0`}>
              <option.icon className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                {option.label}
              </h3>
              <p className="text-xs md:text-sm text-text-muted mt-1 leading-tight">
                {option.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </BottomSheet>
  );
}
