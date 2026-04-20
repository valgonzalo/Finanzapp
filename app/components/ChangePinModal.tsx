"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import PinDots from './PinDots';
import PinPad from './PinPad';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'current' | 'new' | 'confirm';

export default function ChangePinModal({ isOpen, onClose }: ChangePinModalProps) {
  const { changePIN } = useAuth();
  const [step, setStep] = useState<Step>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleNumber = async (num: string) => {
    if (success) return;

    if (step === 'current') {
      if (currentPin.length < 4) {
        const val = currentPin + num;
        setCurrentPin(val);
        if (val.length === 4) {
          setStep('new');
        }
      }
    } else if (step === 'new') {
      if (newPin.length < 4) {
        const val = newPin + num;
        setNewPin(val);
        if (val.length === 4) setStep('confirm');
      }
    } else if (step === 'confirm') {
      if (confirmPin.length < 4) {
        const val = confirmPin + num;
        setConfirmPin(val);
        if (val.length === 4) {
          if (val === newPin) {
            const ok = await changePIN(currentPin, newPin);
            if (ok) {
              setSuccess(true);
              setTimeout(() => {
                onClose();
                reset();
              }, 1500);
            } else {
              handleError();
            }
          } else {
            handleError();
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (success) return;
    if (step === 'current') setCurrentPin(prev => prev.slice(0, -1));
    else if (step === 'new') setNewPin(prev => prev.slice(0, -1));
    else if (step === 'confirm') setConfirmPin(prev => prev.slice(0, -1));
  };

  const handleError = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
      reset();
    }, 600);
  };

  const reset = () => {
    setStep('current');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setSuccess(false);
  };

  const getTitle = () => {
    if (success) return '¡PIN Cambiado!';
    if (step === 'current') return 'Ingresá PIN actual';
    if (step === 'new') return 'Ingresá nuevo PIN';
    return 'Confirmá nuevo PIN';
  };

  const getCurrentVal = () => {
    if (step === 'current') return currentPin;
    if (step === 'new') return newPin;
    return confirmPin;
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 m-0 overflow-hidden"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-[#0A0A0A] w-full h-full flex flex-col items-center justify-center relative p-0 m-0"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-[10000]"
            >
              <X size={28} className="text-white" />
            </button>

            <div className="flex flex-col items-center gap-12 w-full max-w-sm px-6">
              <div className="text-center space-y-4">
                <h2 className={`text-4xl font-bold font-display tracking-tight ${success ? 'text-[#00FF88]' : 'text-white'}`}>
                  {getTitle()}
                </h2>
                <p className="text-white/40 text-lg font-['Inter']">
                  {success ? 'Tu seguridad ha sido actualizada' : 'Mantené tu cuenta protegida'}
                </p>
              </div>

              <PinDots length={getCurrentVal().length} error={error} />

              <div className="w-full pt-8">
                <PinPad 
                  onNumber={handleNumber} 
                  onDelete={handleDelete} 
                  disabled={success} 
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
