'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Check, AlertCircle } from 'lucide-react';
import { parseNaturalLanguage, ParsedTransaction } from '@/lib/nlp';
import { db } from '@/lib/db';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { useCurrency } from '@/hooks/useCurrency';

type Message = {
  role: 'bot' | 'user';
  content: string;
  data?: ParsedTransaction;
  status?: 'pending' | 'success' | 'error' | 'cancelled';
};

export default function ChatBot() {
  const { t, lang } = useTranslation();
  const { formatCurrency, currencyId, rates } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting on open or language change
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'bot', content: t.chatbot.greeting }]);
    }
  }, [t.chatbot.greeting, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Remove previous pending messages to avoid accumulation
    setMessages(prev => {
      const filtered = prev.filter(m => m.status !== 'pending');
      return [...filtered, { role: 'user', content: userMessage }];
    });

    // Parsing logic
    const parsed = parseNaturalLanguage(userMessage, lang, currencyId, rates);

    if (parsed) {
      const categories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
      const categoryLabel = categories.find(c => c.id === parsed.category)?.label || parsed.category;
      
      let responseText = '';
      const formattedAmount = formatCurrency(parsed.amount);

      if (parsed.type === 'expense') {
        responseText = t.chatbot.confirm_expense
          .replace('{amount}', formattedAmount)
          .replace('{category}', categoryLabel);
      } else if (parsed.type === 'income') {
        responseText = t.chatbot.confirm_income.replace('{amount}', formattedAmount);
      } else if (parsed.type === 'debt') {
        responseText = t.chatbot.confirm_debt
          .replace('{person}', parsed.personName || '...')
          .replace('{amount}', formattedAmount);
      } else if (parsed.type === 'reminder') {
        responseText = t.chatbot.confirm_reminder
          .replace('{description}', parsed.description)
          .replace('{amount}', formattedAmount);
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: responseText, 
        data: parsed, 
        status: 'pending' 
      }]);
    } else {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: t.chatbot.unknown 
      }]);
    }
  };

  const confirmAction = async (data: ParsedTransaction, messageIndex: number) => {
    try {
      if (data.type === 'income' || data.type === 'expense') {
        await db.transactions.add({
          amount: data.amount,
          type: data.type,
          category: data.category,
          description: data.description,
          date: data.date!,
          created_at: new Date().toISOString()
        });
      } else if (data.type === 'debt') {
        await db.debts.add({
          person_name: data.personName!,
          total_amount: data.amount,
          paid_amount: 0,
          has_installments: 0,
          notes: data.description,
          status: 'pending',
          created_at: data.date!,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
          installments_count: 1
        });
      } else if (data.type === 'reminder') {
        await db.reminders.add({
          title: data.description,
          amount: data.amount,
          date: data.date!,
          time: '10:00',
          type: 'general',
          is_active: 1,
          recurrence: 'once',
          created_at: new Date().toISOString()
        });
      }

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = { ...newMessages[messageIndex], content: t.chatbot.success, status: 'success' };
        return newMessages;
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = { ...newMessages[messageIndex], content: t.chatbot.error, status: 'error' };
        return newMessages;
      });
    }
  };

  const cancelAction = (messageIndex: number) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[messageIndex] = { 
        ...newMessages[messageIndex], 
        content: t.chatbot.cancelled, 
        status: 'cancelled' 
      };
      return newMessages;
    });
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-40 right-6 md:bottom-28 md:right-8 w-14 h-14 bg-primary text-background rounded-full shadow-2xl z-50 flex items-center justify-center border-4 border-background overflow-hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-8 h-8" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-56 right-4 left-4 md:bottom-48 md:right-8 md:left-auto md:w-96 max-h-[500px] bg-surface border border-border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-surface-alt p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-text-primary">FinanzBot</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-background/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-primary text-background' 
                      : 'bg-surface-alt text-text-primary border border-border/50'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    
                    {msg.status === 'pending' && msg.data && (
                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={() => confirmAction(msg.data!, i)}
                          className="flex-1 bg-primary/20 text-primary border border-primary/30 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary/30 transition-colors"
                        >
                          <Check className="w-3 h-3" /> {t.chatbot.confirm_btn}
                        </button>
                        <button 
                          onClick={() => cancelAction(i)}
                          className="px-3 bg-surface border border-border py-1.5 rounded-xl text-xs font-medium text-text-muted hover:text-error hover:border-error/30 transition-colors"
                        >
                          {t.chatbot.cancel_btn}
                        </button>
                      </div>
                    )}

                    {(msg.status === 'success' || msg.status === 'cancelled') && (
                      <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${msg.status === 'success' ? 'text-primary' : 'text-text-muted italic'}`}>
                        {msg.status === 'success' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-surface-alt border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chatbot.placeholder}
                  className="w-full bg-background border border-border rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary transition-colors pr-12"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1.5 w-9 h-9 bg-primary text-background rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
