'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: ArrowLeftRight, label: 'Transacciones' },
    { href: '/debts', icon: Users, label: 'Deudas' },
    { href: '/reminders', icon: Bell, label: 'Recordatorios' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-safe pt-2 px-4 z-50 md:top-0 md:bottom-0 md:right-auto md:w-20 md:border-t-0 md:border-r md:flex-col md:pt-8 md:px-2">
      <div className="flex justify-around items-center md:flex-col md:gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 transition-colors",
                isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
