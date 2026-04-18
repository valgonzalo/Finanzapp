'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Users, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '@/hooks/useTranslation';
import { CURRENCIES, LANGUAGES } from '@/lib/constants';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import BottomSheet from './BottomSheet';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { lang, t } = useTranslation();
  const navItems = [
    { href: '/', icon: Home, label: lang === 'en' ? 'Dashboard' : lang === 'pt' ? 'Painel' : lang === 'it' ? 'Dashboard' : lang === 'fr' ? 'Tableau' : 'Dashboard' },
    { href: '/transactions', icon: ArrowLeftRight, label: lang === 'en' ? 'Transactions' : lang === 'pt' ? 'Transações' : lang === 'it' ? 'Transazioni' : lang === 'fr' ? 'Transactions' : 'Transacciones' },
    { href: '/debts', icon: Users, label: lang === 'en' ? 'Debts' : lang === 'pt' ? 'Dívidas' : lang === 'it' ? 'Debiti' : lang === 'fr' ? 'Dettes' : 'Deudas' },
    { href: '/reminders', icon: Bell, label: lang === 'en' ? 'Reminders' : lang === 'pt' ? 'Lembretes' : lang === 'it' ? 'Promemoria' : lang === 'fr' ? 'Rappels' : 'Recordatorios' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-border pb-safe pt-2 px-0 z-50 md:top-0 md:bottom-0 md:right-auto md:w-24 lg:w-28 xl:w-32 md:border-t-0 md:border-r md:flex md:flex-col md:pt-12 md:pb-8 md:px-0">
      {/* Mobile Grid / Desktop Column */}
      <div className="grid grid-cols-5 md:flex md:flex-col h-full w-full max-w-lg mx-auto md:max-w-none md:gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 transition-all duration-300 relative group outline-none",
                isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center",
                isActive ? "bg-primary/10 shadow-[0_0_20px_rgba(0,255,136,0.15)]" : "group-hover:bg-surface-alt"
              )}>
                <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[9px] md:text-[10px] lg:text-[11px] font-bold tracking-wide uppercase transition-all text-center mt-1.5 px-2 leading-tight w-full",
                "line-clamp-1 md:line-clamp-2 md:whitespace-normal",
                isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute -right-[0.5px] top-1/2 -translate-y-1/2 w-[3px] h-10 bg-primary rounded-l-full hidden md:block shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                />
              )}
            </Link>
          );
        })}

        {/* Settings at the end on both mobile and desktop */}
        <div className="flex md:mt-auto items-center justify-center">
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center justify-center py-2 w-full transition-all duration-300 relative group outline-none",
              pathname === '/settings' ? "text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center",
              pathname === '/settings' ? "bg-primary/10 shadow-[0_0_20px_rgba(0,255,136,0.15)]" : "group-hover:bg-surface-alt"
            )}>
              <Settings className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <span className={cn(
              "text-[9px] md:text-[10px] lg:text-[11px] font-bold tracking-wide uppercase transition-all text-center mt-1.5 px-2 leading-tight w-full",
              "line-clamp-1 md:line-clamp-2 md:whitespace-normal",
              pathname === '/settings' ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )}>
              {t.dashboard.settings}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
