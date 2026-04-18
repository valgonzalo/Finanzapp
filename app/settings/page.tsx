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
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { lang, t } = useTranslation();
  const settings = useLiveQuery(() => db.settings.toArray());
  const userSettings = settings?.[0];

  const handleUpdateSetting = async (key: string, value: any) => {
    if (userSettings?.id) {
      await db.settings.update(userSettings.id, { [key]: value });
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
            <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{lang === 'es' ? 'Notificaciones' : 'Notifications'}</h4>
                  <p className="text-xs text-text-muted">{lang === 'es' ? 'Alertas de vencimientos y recordatorios' : 'Due date and reminder alerts'}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
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
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    userSettings?.isSecurityEnabled ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
                  )}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{t.security.title}</h4>
                    <p className="text-xs text-text-muted">{t.security.enable_pin}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUpdateSetting('isSecurityEnabled', userSettings?.isSecurityEnabled ? 0 : 1)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                    userSettings?.isSecurityEnabled ? "bg-primary" : "bg-surface-alt border border-border/50"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
                    userSettings?.isSecurityEnabled ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              {userSettings?.isSecurityEnabled === 1 && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase ml-2">{t.security.setup_pin}</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userSettings?.pin || ''} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 4) handleUpdateSetting('pin', val);
                    }}
                    className="w-full bg-surface-alt border border-border/50 rounded-2xl p-4 text-text-primary focus:border-primary outline-none transition-all font-mono text-2xl tracking-[1em] text-center mt-2"
                    placeholder="****"
                  />
                </div>
              )}
            </div>

            <div 
              onClick={() => alert(lang === 'es' ? 'Funcionalidad de exportación en desarrollo...' : 'Export functionality in development...')}
              className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{lang === 'es' ? 'Exportar Datos' : 'Export Data'}</h4>
                  <p className="text-xs text-text-muted">{lang === 'es' ? 'Descargar una copia de seguridad local (JSON)' : 'Download a local backup copy (JSON)'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </div>
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
            <button className="bg-surface-alt hover:bg-surface border border-border/50 text-text-primary font-bold py-2 px-6 rounded-2xl text-sm transition-all">
              {lang === 'es' ? 'Contactar Desarrollador' : 'Contact Developer'}
            </button>
          </div>
        </motion.section>

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
  );
}
