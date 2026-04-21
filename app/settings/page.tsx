'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { CURRENCIES, LANGUAGES } from '@/lib/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'motion/react';
import { 
  User, 
  Globe, 
  Coins, 
  Bell, 
  Moon, 
  ShieldCheck, 
  Download, 
  Trash2, 
  ChevronRight,
  Info,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import ChangePinModal from '@/app/components/ChangePinModal';
import RecurringList from '@/app/components/RecurringList';
import RecurringModal from '@/app/components/RecurringModal';
import { exportDataToJSON, importDataFromJSON } from '@/app/utils/backup';
import Toast from '@/app/components/Toast';
import { Upload } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { lang, t } = useTranslation();
  const settings = useLiveQuery(() => db.settings.toArray());
  const userSettings = settings?.[0];
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    if (userSettings?.id) {
      await db.settings.update(userSettings.id, { [key]: value });
    } else {
      await db.settings.add({
        userName: 'Usuario',
        onboardingCompleted: 1,
        currency: 'ARS',
        language: 'es',
        isSecurityEnabled: 1,
        isNotificationsEnabled: 1,
        [key]: value
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 md:p-10 lg:p-16 space-y-10 md:space-y-12 pb-32 max-w-7xl mx-auto"
      >
      <header className="pt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-surface-alt transition-colors md:hidden"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <h1 className="text-text-primary text-3xl md:text-5xl font-display font-bold tracking-tight">
              {t.dashboard.settings}
            </h1>
          </div>
          <p className="text-text-secondary text-sm md:text-lg">
            {t.dashboard.preferences}
          </p>
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Profile Section */}
        <motion.section variants={sectionVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-text-muted">
            <User className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">{lang === 'es' ? 'Perfil' : 'Profile'}</h3>
          </div>
          <div className="bg-surface/50 backdrop-blur-xl rounded-3xl p-6 border border-border/50 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase ml-2">{lang === 'es' ? 'Tu Nombre' : 'Your Name'}</label>
              <input 
                type="text" 
                value={userSettings?.userName || ''} 
                onChange={(e) => handleUpdateSetting('userName', e.target.value)}
                className="w-full bg-surface-alt border border-border/50 rounded-2xl p-4 text-text-primary focus:border-primary outline-none transition-all font-medium"
                placeholder={lang === 'es' ? 'Ingresa tu nombre' : 'Enter your name'}
              />
            </div>
          </div>
        </motion.section>

        {/* Currency & Language Card */}
        <motion.section variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 text-text-muted">
              <Coins className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">{t.dashboard.currency}</h3>
            </div>
            <div className="bg-surface/50 backdrop-blur-xl rounded-3xl p-4 border border-border/50 shadow-sm grid grid-cols-2 gap-2">
              {CURRENCIES.slice(0, 4).map(c => (
                <button
                  key={c.id}
                  onClick={() => handleUpdateSetting('currency', c.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1",
                    userSettings?.currency === c.id 
                      ? "border-primary bg-primary/10 text-text-primary shadow-[0_0_15px_rgba(0,255,136,0.1)]" 
                      : "border-transparent bg-surface-alt text-text-muted hover:bg-surface"
                  )}
                >
                  <span className="font-bold text-xl">{c.symbol}</span>
                  <span className="text-[10px] font-bold">{c.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 text-text-muted">
              <Globe className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">{t.dashboard.language}</h3>
            </div>
            <div className="bg-surface/50 backdrop-blur-xl rounded-3xl p-4 border border-border/50 shadow-sm grid grid-cols-3 gap-2">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleUpdateSetting('language', l.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1",
                    userSettings?.language === l.id 
                      ? "border-primary bg-primary/10 text-text-primary" 
                      : "border-transparent bg-surface-alt text-text-muted hover:bg-surface"
                  )}
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className="text-[10px] font-bold uppercase">{l.id}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Preferences & System */}
        <motion.section variants={sectionVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-text-muted">
            <Bell className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">{lang === 'es' ? 'Preferencias de Sistema' : 'System Preferences'}</h3>
          </div>
          <div className="bg-surface/50 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden divide-y divide-border/30">
            <div 
              onClick={() => handleUpdateSetting('isNotificationsEnabled', userSettings?.isNotificationsEnabled ? 0 : 1)}
              className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{lang === 'es' ? 'Notificaciones' : 'Notifications'}</h4>
                  <p className="text-xs text-text-muted">{lang === 'es' ? 'Alertas de vencimientos y recordatorios' : 'Due date and reminder alerts'}</p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full p-1 transition-all duration-300",
                userSettings?.isNotificationsEnabled ? "bg-primary" : "bg-border"
              )}>
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                  userSettings?.isNotificationsEnabled ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>

            <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-text-muted/10 flex items-center justify-center text-text-muted">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{lang === 'es' ? 'Modo Oscuro' : 'Dark Mode'}</h4>
                  <p className="text-xs text-text-muted">{lang === 'es' ? 'Cuidado visual y ahorro de energía' : 'Visual care and energy saving'}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-alt border border-border/50">AUTO</span>
            </div>

            <div className="p-6 flex flex-col gap-4 group hover:bg-primary/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{t.security.title}</h4>
                    <p className="text-xs text-text-muted">{lang === 'es' ? 'Tu acceso está protegido con PIN' : 'Your access is protected with PIN'}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                  {lang === 'es' ? 'ACTIVO' : 'ACTIVE'}
                </div>
              </div>

              {typeof window !== 'undefined' && localStorage.getItem('pin_configured') === 'true' && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => setIsChangePinOpen(true)}
                    className="w-full bg-surface-alt border border-border/50 hover:border-primary/50 text-text-primary font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {lang === 'es' ? 'Cambiar PIN de Acceso' : 'Change Access PIN'}
                  </button>
                </div>
              )}
            </div>



            <div 
              onClick={async () => {
                const ok = await exportDataToJSON();
                if (ok) showToast(lang === 'es' ? 'Backup exportado con éxito' : 'Backup exported successfully');
                else showToast(lang === 'es' ? 'Error al exportar' : 'Export failed', 'error');
              }}
              className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{lang === 'es' ? 'Exportar Backup' : 'Export Backup'}</h4>
                  <p className="text-xs text-text-muted">{lang === 'es' ? 'Descargar una copia de seguridad local (JSON)' : 'Download a local backup copy (JSON)'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
            </div>

            <div 
              className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer relative"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{lang === 'es' ? 'Importar Backup' : 'Import Backup'}</h4>
                  <p className="text-xs text-text-muted">{lang === 'es' ? 'Cargar datos desde un archivo JSON' : 'Upload data from a JSON file'}</p>
                </div>
              </div>
              <input 
                type="file" 
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (confirm(lang === 'es' ? '¿Restaurar backup? Los datos actuales se reemplazarán.' : 'Restore backup? Current data will be replaced.')) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const ok = await importDataFromJSON(event.target?.result as string);
                      if (ok) {
                        showToast(lang === 'es' ? 'Datos importados. Reiniciando...' : 'Data imported. Reloading...');
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        showToast(lang === 'es' ? 'Error al importar archivo' : 'Error importing file', 'error');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </div>
        </motion.section>

        {/* Recurrentes Section */}
        <motion.section variants={sectionVariants} className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">{lang === 'es' ? 'Movimientos Recurrentes' : 'Recurring Movements'}</h3>
            </div>
            <button 
              onClick={() => setIsRecurringModalOpen(true)}
              className="text-[10px] font-bold text-primary hover:text-primary-bright uppercase tracking-tighter bg-primary/10 px-3 py-1 rounded-full border border-primary/20 transition-all"
            >
              + {lang === 'es' ? 'Nuevo' : 'New'}
            </button>
          </div>
          
          <RecurringList />
        </motion.section>

        {/* Info & Support */}
        <motion.section variants={sectionVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-text-muted">
            <Info className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">{lang === 'es' ? 'Soporte e Información' : 'Support & Info'}</h3>
          </div>
          <div className="bg-surface/50 backdrop-blur-xl rounded-3xl p-6 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-text-primary">FinanzApp Pro</h4>
              <p className="text-xs text-text-muted mt-1">Version 1.4.0 • Build 2026.04</p>
            </div>
            <Link 
              href="https://wa.me/5491133131097?text=Hola%20Val,%20tengo%20una%20consulta%20sobre%20FinanzApp"
              target="_blank"
              className="bg-surface-alt hover:bg-surface border border-border/50 text-text-primary font-bold py-2 px-6 rounded-2xl text-sm transition-all text-center no-underline"
            >
              {lang === 'es' ? 'Contactar Desarrollador' : 'Contact Developer'}
            </Link>
          </div>
        </motion.section>

        <RecurringModal 
          isOpen={isRecurringModalOpen} 
          onClose={() => setIsRecurringModalOpen(false)} 
        />

        {/* Danger Zone */}
        <motion.section variants={sectionVariants} className="pt-8">
          <div className="bg-error/5 rounded-3xl border border-error/20 p-6 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-error">{lang === 'es' ? 'Zona Peligrosa' : 'Danger Zone'}</h4>
              <p className="text-xs text-error/60 mt-1">{lang === 'es' ? 'Borrar permanentemente todos los datos de la app' : 'Permanently delete all app data'}</p>
            </div>
            <button 
              onClick={() => {
                if (confirm(lang === 'es' ? '¿Estás seguro? Se borrarán TODOS tus datos.' : 'Are you sure? ALL data will be deleted.')) {
                  db.delete().then(() => window.location.reload());
                }
              }}
              className="bg-error text-white p-3 rounded-2xl text-xs font-bold px-6 shadow-lg shadow-error/20 hover:bg-error-dim transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {lang === 'es' ? 'Reiniciar App' : 'Reset App'}
            </button>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>

    <ChangePinModal 
      isOpen={isChangePinOpen} 
      onClose={() => setIsChangePinOpen(false)} 
    />

    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
  </div>
);
}
