'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import GlobalAddModal from './GlobalAddModal';
import ChatUI from '@/app/components/ChatUI';

export default function FloatingActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ChatUI />

      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 flex flex-col gap-4 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-finanzbot'))}
          className="w-14 h-14 bg-surface-alt text-primary rounded-full shadow-2xl flex items-center justify-center border-4 border-background"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04221 16.4525L2.04944 21.0583C1.94279 21.5543 2.44573 22.0572 2.9417 21.9506L7.54752 20.9578C8.88842 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM8 11C7.44772 11 7 10.5523 7 10C7 9.44772 7.44772 9 8 9C8.55228 9 9 9.44772 9 10C9 10.5523 8.55228 11 8 11ZM12 11C11.4477 11 11 10.5523 11 10C11 9.44772 11.4477 9 12 9C12.5523 9 13 9.44772 13 10C13 10.5523 12.5523 11 12 11ZM16 11C15.4477 11 15 10.5523 15 10C15 9.44772 15.4477 9 16 9C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11Z" />
              <path d="M16 15H8C7.44772 15 7 15.4477 7 16C7 16.5523 7.44772 17 8 17H16C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15Z" />
            </svg>
          </motion.div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-primary text-background rounded-full shadow-2xl flex items-center justify-center border-4 border-background"
        >
          <Plus className="w-8 h-8 font-bold" />
        </motion.button>
      </div>

      <GlobalAddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
