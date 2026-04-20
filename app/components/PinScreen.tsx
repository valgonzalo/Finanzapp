"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import PinDots from './PinDots';
import PinPad from './PinPad';

export default function PinScreen() {
  const { authState, unlock, setupPIN, lockoutTime } = useAuth();
  const [pin, setPin] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumber = (num: string) => {
    if (pin.length < 4 && lockoutTime === 0) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      const processPin = async () => {
        if (authState === 'setup') {
          if (!confirming) {
            setFirstPin(pin);
            setConfirming(true);
            setPin('');
          } else {
            if (pin === firstPin) {
              await setupPIN(pin);
            } else {
              setError(true);
              setTimeout(() => {
                setError(false);
                setPin('');
                setConfirming(false);
                setFirstPin('');
              }, 600);
            }
          }
        } else if (authState === 'locked') {
          const success = await unlock(pin);
          if (!success) {
            setError(true);
            setTimeout(() => {
              setError(false);
              setPin('');
            }, 600);
          }
        }
      };
      processPin();
    }
  }, [pin, confirming, firstPin, authState, setupPIN, unlock]);

  const getTitle = () => {
    if (authState === 'setup') {
      return confirming ? 'Confirmá tu PIN' : 'Creá tu PIN';
    }
    return lockoutTime > 0 ? 'Sistema Bloqueado' : 'Ingresá tu PIN';
  };

  const getSubtitle = () => {
    if (lockoutTime > 0) {
      return `Reintentá en ${lockoutTime} segundos`;
    }
    return 'Protegé tu información financiera';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-12">
        <div className="text-center space-y-3">
          <motion.h1 
            key={getTitle()}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-4xl font-bold font-display tracking-tight ${lockoutTime > 0 ? 'text-red-500' : 'text-white'}`}
          >
            {getTitle()}
          </motion.h1>
          <p className="text-[#A1A1AA] text-lg font-['Inter']">
            {getSubtitle()}
          </p>
        </div>

        <PinDots length={pin.length} error={error} />

        <div className="w-full pt-4">
          <PinPad 
            onNumber={handleNumber} 
            onDelete={handleDelete} 
            disabled={lockoutTime > 0} 
          />
        </div>
      </div>
    </motion.div>
  );
}
