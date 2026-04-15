'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import ChatBot from './ChatBot';

export default function FloatingActions() {
  const pathname = usePathname();
  const router = useRouter();

  const handleAddClick = () => {
    if (pathname === '/transactions') {
      router.push('/transactions?add=true');
    } else if (pathname === '/debts') {
      router.push('/debts?add=true');
    } else if (pathname === '/reminders') {
      router.push('/reminders?add=true');
    } else {
      router.push('/transactions?add=true'); // Default to add trans
    }
  };

  return (
    <>
      {/* Bot is positioned higher now */}
      <ChatBot />

      {/* Main Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleAddClick}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-background rounded-full shadow-2xl z-40 flex items-center justify-center border-4 border-background"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </>
  );
}
