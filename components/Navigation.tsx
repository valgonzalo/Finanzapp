'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: ArrowLeftRight, label: 'Transacciones' },
    { href: '/debts', icon: Users, label: 'Deudas' },
    { href: '/reminders', icon: Bell, label: 'Recordatorios' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border pb-safe pt-2 px-4 z-50 md:top-0 md:bottom-0 md:right-auto md:w-24 lg:w-28 md:border-t-0 md:border-r md:flex md:flex-col md:pt-10 md:px-0">
      <div className="flex justify-around items-center md:flex-col md:gap-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full gap-1.5 transition-all duration-300 relative group",
                isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-primary/10 shadow-[0_0_15px_rgba(0,255,136,0.2)]" : "group-hover:bg-surface-alt"
              )}>
                <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] md:text-xs font-semibold tracking-wide uppercase transition-all",
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
    </nav>
  );
}
