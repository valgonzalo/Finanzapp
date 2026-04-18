'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowRight, ArrowLeft, Check, Globe, Coins, User, ShieldCheck } from 'lucide-react';
import { CURRENCIES, LANGUAGES } from '@/lib/constants';

type OnboardingStep = 'welcome' | 'name' | 'currency' | 'language' | 'ready';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await db.settings.add({
        userName: name.trim() || 'Usuario',
        currency: selectedCurrency,
        language: selectedLanguage,
        onboardingCompleted: 1
      });
      onComplete();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('name');
    else if (step === 'name') setStep('currency');
    else if (step === 'currency') setStep('language');
    else if (step === 'language') setStep('ready');
  };

  const prevStep = () => {
    if (step === 'name') setStep('welcome');
    else if (step === 'currency') setStep('name');
    else if (step === 'language') setStep('currency');
    else if (step === 'ready') setStep('language');
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed inset-0 min-h-screen flex flex-col items-center justify-center p-6 bg-background z-[9999] overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-12 text-center"
            >
              <div className="flex justify-center">
                <motion.div 
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-24 h-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center border border-primary/30 shadow-[0_0_50px_rgba(0,255,136,0.3)]"
                >
                  <Wallet className="w-12 h-12 text-primary" />
                </motion.div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-text-primary tracking-tight leading-tight">
                  Gestiona con <br /><span className="text-primary italic">Estilo</span>
                </h1>
                <p className="text-text-secondary text-lg md:text-xl max-w-sm mx-auto leading-relaxed">
                  Bienvenido a la herramienta financiera más sofisticada, privada y personal.
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] bg-primary/5 w-fit mx-auto px-4 py-2 rounded-full border border-primary/10">
                  <ShieldCheck className="w-4 h-4" />
                  Soberanía de Datos Garantizada
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="w-full max-w-xs mx-auto bg-primary text-text-inverse font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all text-xl"
              >
                Comenzar <ArrowRight className="w-6 h-6" />
              </motion.button>
            </motion.div>
          )}

          {step === 'name' && (
            <motion.div 
              key="name"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-text-primary">¿Cuál es tu nombre?</h2>
                <p className="text-text-secondary">Para personalizar tu experiencia financiera.</p>
              </div>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escribe tu nombre..."
                className="w-full bg-surface-alt border border-border/50 rounded-2xl p-5 text-xl text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-xl"
              />
              <div className="flex gap-4">
                <button onClick={prevStep} className="p-5 rounded-2xl border border-border/50 text-text-muted hover:bg-surface-alt transition-all">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button 
                  disabled={!name.trim()}
                  onClick={nextStep} 
                  className="flex-1 bg-primary text-text-inverse font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Siguiente <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'currency' && (
            <motion.div 
              key="currency"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Coins className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-3xl font-display font-bold text-text-primary">Elige tu moneda</h2>
                <p className="text-text-secondary">Usaremos esta moneda para todos tus balances.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCurrency(c.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedCurrency === c.id 
                        ? 'border-primary bg-primary/5 text-text-primary' 
                        : 'border-border/50 bg-surface-alt text-text-muted hover:border-border hover:bg-surface-alt/80'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-lg font-bold">{c.symbol}</span>
                      {selectedCurrency === c.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm font-medium leading-tight">{c.label}</p>
                    <p className="text-[10px] opacity-60 uppercase">{c.id}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={prevStep} className="p-5 rounded-2xl border border-border/50 text-text-muted hover:bg-surface-alt transition-all">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextStep} 
                  className="flex-1 bg-primary text-text-inverse font-bold rounded-2xl flex items-center justify-center gap-2"
                >
                  Siguiente <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'language' && (
            <motion.div 
              key="language"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="text-3xl font-display font-bold text-text-primary">Idioma de la App</h2>
                <p className="text-text-secondary">Configura FinanzApp en tu lenguaje nativo.</p>
              </div>
              <div className="space-y-3">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLanguage(l.id)}
                    className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      selectedLanguage === l.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border/50 bg-surface-alt text-text-muted'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{l.flag}</span>
                      <span className="font-bold text-lg">{l.label}</span>
                    </div>
                    {selectedLanguage === l.id && <Check className="w-6 h-6" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={prevStep} className="p-5 rounded-2xl border border-border/50 text-text-muted hover:bg-surface-alt transition-all">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextStep} 
                  className="flex-1 bg-primary text-text-inverse font-bold rounded-2xl flex items-center justify-center gap-2"
                >
                  Finalizar Configuración <Check className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'ready' && (
            <motion.div 
              key="ready"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8 text-center"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary relative">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                  <Check className="w-12 h-12 z-10" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-display font-bold text-text-primary">¡Todo listo, {name}!</h2>
                <p className="text-text-secondary max-w-sm mx-auto">
                  Hemos configurado FinanzApp según tus preferencias. Tus datos ya están seguros y listos para usar.
                </p>
              </div>
              <div className="bg-surface-alt/50 border border-border/50 rounded-3xl p-6 text-left space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted italic">Moneda:</span>
                  <span className="font-bold text-text-primary uppercase">{selectedCurrency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted italic">Idioma:</span>
                  <span className="font-bold text-text-primary uppercase">{LANGUAGES.find(l => l.id === selectedLanguage)?.label}</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full bg-primary text-text-inverse font-bold py-5 rounded-2xl text-xl shadow-xl shadow-primary/20"
              >
                {isSubmitting ? 'Iniciando...' : 'Comenzar ahora'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {step !== 'welcome' && step !== 'ready' && (
          <div className="mt-8 flex justify-center gap-2">
            {(['name', 'currency', 'language'] as const).map((s) => (
              <div 
                key={s} 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-primary' : 'bg-border'}`} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
