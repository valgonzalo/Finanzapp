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
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border pb-safe pt-2 px-2 z-50 md:top-0 md:bottom-0 md:right-auto md:w-20 lg:w-24 xl:w-28 md:border-t-0 md:border-r md:flex md:flex-col md:pt-10 md:pb-10 md:px-0">
      <div className="flex justify-around items-center md:flex-col md:gap-10 h-full max-w-[500px] mx-auto md:max-w-none">
        <div className="flex justify-around md:justify-start items-center w-full md:flex-col md:gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] md:w-full gap-1 transition-all duration-300 relative group px-1",
                  isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
                )}
              >
                <div className={cn(
                  "p-2 md:p-2.5 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/10 shadow-[0_0_15px_rgba(0,255,136,0.2)]" : "group-hover:bg-surface-alt"
                )}>
                  <Icon className="w-5 h-5 xs:w-6 xs:h-6 md:w-7 md:h-7" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[9px] xs:text-[10px] md:text-[11px] font-semibold tracking-wide uppercase transition-all text-center leading-tight",
                  "whitespace-nowrap md:whitespace-normal overflow-hidden md:overflow-visible text-ellipsis md:text-clip max-w-[65px] md:max-w-none",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-l-full hidden md:block shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="md:mt-auto py-2 md:py-0">
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center justify-center min-w-[60px] md:w-full gap-1 transition-all duration-300 relative group px-1",
              pathname === '/settings' ? "text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <div className={cn(
              "p-2 md:p-2.5 rounded-2xl transition-all duration-300",
              pathname === '/settings' ? "bg-primary/10 shadow-[0_0_15px_rgba(0,255,136,0.2)]" : "group-hover:bg-surface-alt"
            )}>
              <Settings className="w-5 h-5 xs:w-6 xs:h-6 md:w-7 md:h-7" />
            </div>
            <span className={cn(
              "text-[9px] xs:text-[10px] md:text-[11px] font-semibold tracking-wide uppercase transition-all text-center leading-tight",
              "whitespace-nowrap md:whitespace-normal overflow-hidden md:overflow-visible text-ellipsis md:text-clip max-w-[65px] md:max-w-none",
              pathname === '/settings' ? "opacity-100" : "opacity-100"
            )}>
              {t.dashboard.settings}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
