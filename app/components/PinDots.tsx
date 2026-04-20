"use client";

import { motion } from 'motion/react';

interface PinDotsProps {
  length: number;
  error?: boolean;
}

export default function PinDots({ length, error }: PinDotsProps) {
  return (
    <motion.div 
      className="flex justify-center gap-6"
      animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`w-[18px] h-[18px] rounded-full border-2 transition-colors duration-200 ${
            index < length 
              ? error ? 'bg-red-500 border-red-500' : 'bg-[#00FF88] border-[#00FF88]' 
              : 'border-[#333333] bg-transparent'
          }`}
          animate={index < length ? { scale: 1.1 } : { scale: 1 }}
        />
      ))}
    </motion.div>
  );
}
