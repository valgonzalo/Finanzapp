'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowRight, ArrowLeft, Check, Globe, Coins, User, ShieldCheck, Lock, Delete } from 'lucide-react';
import { CURRENCIES, LANGUAGES } from '@/lib/constants';
import { useAuth } from '@/app/context/AuthContext';

import { translations } from '@/lib/translations';

type OnboardingStep = 'welcome' | 'name' | 'currency' | 'language' | 'security' | 'ready';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { setupPIN } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current translation based on selection
  const t = (translations[selectedLanguage as keyof typeof translations] || translations.es).onboarding;
  const common = (translations[selectedLanguage as keyof typeof translations] || translations.es).common;

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await db.settings.add({
        userName: name.trim() || 'Usuario',
        currency: selectedCurrency,
        language: selectedLanguage,
        isSecurityEnabled: 1,
        pin: pin,
        onboardingCompleted: 1
      });

      if (pin.length === 4) {
        await setupPIN(pin);
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('language');
    else if (step === 'language') setStep('name');
    else if (step === 'name') setStep('currency');
    else if (step === 'currency') setStep('security');
    else if (step === 'security') setStep('ready');
  };

  const prevStep = () => {
    if (step === 'language') setStep('welcome');
    else if (step === 'name') setStep('language');
    else if (step === 'currency') setStep('name');
    else if (step === 'security') setStep('currency');
    else if (step === 'ready') setStep('security');
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
                  {selectedLanguage === 'es' ? (
                    <>Gestiona con <br /><span className="text-primary italic">Estilo</span></>
                  ) : t.welcome_title}
                </h1>
                <p className="text-text-secondary text-lg md:text-xl max-w-sm mx-auto leading-relaxed">
                  {t.welcome_subtitle}
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] bg-primary/5 w-fit mx-auto px-4 py-2 rounded-full border border-primary/10">
                  <ShieldCheck className="w-4 h-4" />
                  {t.data_security}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="w-full max-w-xs mx-auto bg-primary text-text-inverse font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all text-xl"
              >
                {t.start_btn} <ArrowRight className="w-6 h-6" />
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
                <h2 className="text-3xl font-display font-bold text-text-primary">{t.name_title}</h2>
                <p className="text-text-secondary">{t.name_subtitle}</p>
              </div>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.name_placeholder}
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
                  {common.next} <ArrowRight className="w-6 h-6" />
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
                <h2 className="text-3xl font-display font-bold text-text-primary">{t.currency_title}</h2>
                <p className="text-text-secondary">{t.currency_subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCurrency(c.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      selectedCurrency === c.id 
                        ? 'border-primary bg-primary/5 text-text-primary' 
                        : 'border-border/50 bg-surface-alt text-text-muted hover:border-border hover:bg-surface-alt/80'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-base font-bold">{c.symbol}</span>
                      {selectedCurrency === c.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs font-bold leading-tight line-clamp-1">{c.label}</p>
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
                  {common.next} <ArrowRight className="w-6 h-6" />
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
                <h2 className="text-3xl font-display font-bold text-text-primary">{t.language_title}</h2>
                <p className="text-text-secondary">{t.language_subtitle}</p>
              </div>
              <div className="space-y-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLanguage(l.id)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      selectedLanguage === l.id 
                        ? 'border-primary bg-primary/5 text-primary shadow-[0_0_15px_rgba(0,255,136,0.1)]' 
                        : 'border-border/50 bg-surface-alt text-text-muted hover:bg-surface-alt/80'
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
                  {common.next} <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'security' && (
            <motion.div 
              key="security"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8 flex flex-col items-center"
            >
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-text-primary">{t.security_title}</h2>
                <p className="text-text-secondary">{t.security_subtitle}</p>
              </div>

              {/* PIN Display */}
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      pin.length >= i ? 'bg-primary border-primary shadow-[0_0_10px_rgba(0,255,136,0.3)]' : 'border-border'
                    }`}
                  />
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    onClick={() => pin.length < 4 && setPin(pin + n)}
                    className="w-14 h-14 rounded-full bg-surface-alt font-bold text-lg hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    {n}
                  </button>
                ))}
                <div />
                <button
                  onClick={() => pin.length < 4 && setPin(pin + '0')}
                  className="w-14 h-14 rounded-full bg-surface-alt font-bold text-lg hover:bg-primary/10 hover:text-primary transition-all"
                >
                  0
                </button>
                <button
                  onClick={() => setPin(pin.slice(0, -1))}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-text-muted hover:text-error transition-all"
                >
                  <Delete className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-4 w-full">
                <button onClick={prevStep} className="p-5 rounded-2xl border border-border/50 text-text-muted hover:bg-surface-alt transition-all">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button 
                  disabled={pin.length < 4}
                  onClick={nextStep} 
                  className="flex-1 bg-primary text-text-inverse font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {t.confirm_pin_btn} <ArrowRight className="w-6 h-6" />
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
                <h2 className="text-4xl font-display font-bold text-text-primary">
                  {t.ready_title.replace('{name}', name)}
                </h2>
                <p className="text-text-secondary max-w-sm mx-auto">
                  {t.ready_subtitle}
                </p>
              </div>
              <div className="bg-surface-alt/50 border border-border/50 rounded-3xl p-6 text-left space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted italic">{translations[selectedLanguage as keyof typeof translations].dashboard.currency}:</span>
                  <span className="font-bold text-text-primary uppercase">{selectedCurrency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted italic">{translations[selectedLanguage as keyof typeof translations].dashboard.language}:</span>
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
                {isSubmitting ? common.loading : t.finish_btn}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {step !== 'welcome' && step !== 'ready' && (
          <div className="mt-8 flex justify-center gap-2">
            {(['language', 'name', 'currency', 'security'] as const).map((s) => (
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
