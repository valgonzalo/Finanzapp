'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import ChatBot from './ChatBot';
import GlobalAddModal from './GlobalAddModal';

export default function FloatingActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ChatBot />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-background rounded-full shadow-2xl z-40 flex items-center justify-center border-4 border-background"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      <GlobalAddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
