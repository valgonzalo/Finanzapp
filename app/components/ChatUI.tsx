"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

export default function ChatUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: '¡Hola! Soy FinanzBot 🤖. Estoy acá para darte inteligencia financiera sobre tus datos. ¿En qué te ayudo?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contextual user data
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const debts = useLiveQuery(() => db.debts.toArray()) || [];
  const settings = useLiveQuery(() => db.settings.limit(1).toArray()) || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-finanzbot', handleOpen);
    return () => window.removeEventListener('open-finanzbot', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Build context from user data
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const pendingDebts = debts.filter(d => d.status !== 'paid').reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

      const contextData = {
        userName: settings?.[0]?.userName || 'Usuario',
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        pendingDebts
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMsg }],
          context: contextData
        }),
      });

      if (!res.ok) {
        throw new Error('API Error');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No pude procesar la respuesta.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, ocurrió un error de conexión.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] md:hidden"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: '100%', opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] md:h-auto md:top-8 md:bottom-8 md:left-auto md:right-8 md:w-[400px] z-[200] flex flex-col bg-[#0A0A0A] md:bg-[#111111]/90 md:backdrop-blur-xl md:border border-white/10 rounded-t-[32px] md:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00FF88]/10 text-[#00FF88] flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-white">FinanzBot</h3>
                    <p className="text-[10px] text-[#00FF88] uppercase tracking-widest font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                      En Línea
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#050505] md:bg-transparent">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 shrink-0 rounded-full flex items-center justify-center border",
                      m.role === 'user' 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-[#00FF88]/10 border-[#00FF88]/20 text-[#00FF88]"
                    )}>
                      {m.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm font-['Inter'] leading-relaxed shadow-sm",
                      m.role === 'user' 
                        ? "bg-[#222] text-white rounded-tr-sm border border-white/5" 
                        : "bg-[#0A0A0A] text-white/90 rounded-tl-sm border border-white/5"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] flex items-center justify-center">
                      <Bot size={14} />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#0A0A0A] rounded-tl-sm border border-white/5 flex gap-1 items-center">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#00FF88] rounded-full opacity-50" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#00FF88] rounded-full opacity-50" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#00FF88] rounded-full opacity-50" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-[#0A0A0A] md:bg-transparent">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Preguntale por tus ahorros..."
                    disabled={isLoading}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-4 pl-6 pr-14 text-white text-sm outline-none focus:border-[#00FF88]/50 transition-colors disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 w-10 h-10 bg-[#00FF88] text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={16} className="-ml-0.5 mt-0.5" />
                  </button>
                </form>
                <p className="text-[9px] text-white/30 text-center mt-3 uppercase tracking-widest font-bold">
                  FinanzBot puede cometer errores.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
