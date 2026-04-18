import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { translations } from '@/lib/translations';
import { useMemo } from 'react';

export function useTranslation() {
  const settings = useLiveQuery(() => db.settings.toArray());
  const userSettings = settings?.[0];
  const lang = (userSettings?.language as keyof typeof translations) || 'es';

  const t = useMemo(() => {
    return translations[lang] || translations.es;
  }, [lang]);

  return { t, lang };
}
