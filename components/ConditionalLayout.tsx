'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Onboarding from './Onboarding';
import { useRouter } from 'next/navigation';
import Navigation from './Navigation';
import FloatingActions from './FloatingActions';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const settings = useLiveQuery(() => db.settings.toArray());
  const [isReady, setIsReady] = useState(false);

  const onboardingCompleted = settings && settings.length > 0 && settings[0].onboardingCompleted;

  useEffect(() => {
    if (settings !== undefined) {
      setIsReady(true);
    }
  }, [settings]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If onboarding is NOT completed, we render ONLY the Onboarding component
  // regardless of which page the user is on
  if (!onboardingCompleted) {
    return <Onboarding onComplete={() => router.refresh()} />;
  }


  // If onboarding IS completed, we render the full system
  return (
    <div className="pb-20 md:pb-0 md:pl-24 lg:pl-28 xl:pl-32 transition-all duration-500">
      {children}
      <Navigation />
      <FloatingActions />
    </div>
  );
}
