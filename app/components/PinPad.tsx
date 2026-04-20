"use client";

import { motion } from 'motion/react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onNumber: (num: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export default function PinPad({ onNumber, onDelete, disabled }: PinPadProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  return (
    <div className="grid grid-cols-3 gap-6 max-w-[320px] mx-auto w-full">
      {numbers.map((key, index) => {
        if (key === '') return <div key={index} />;
        
        return (
          <motion.button
            key={index}
            whileHover={{ backgroundColor: '#00FF8815' }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            onClick={() => key === 'delete' ? onDelete() : onNumber(key)}
            className="w-[72px] h-[72px] rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-2xl font-bold font-display border border-transparent hover:border-[#00FF8840] transition-colors disabled:opacity-50"
          >
            {key === 'delete' ? (
              <Delete size={28} />
            ) : (
              key
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
