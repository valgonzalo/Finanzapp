# Changelog - FinanzApp

Historial de cambios y evolución del sistema.

## [2.2.0] - 2026-04-18
### 🔒 Seguridad Biométrica y Privacidad Reforzada
- **Gateway de Seguridad**: Implementación de un `SecurityGate` avanzado. Antes la app era de acceso libre tras el onboarding; ahora cuenta con un bloqueo por PIN obligatorio si el usuario lo desea.
- **PIN & WebAuthn**: Añadido soporte para PIN de 4 dígitos y esqueleto de autenticación biométrica (Fingerprint) para navegadores compatibles.
- **Recuperación Anti-Intrusos**: Nuevo sistema de "wipe" local en caso de olvido de PIN, garantizando que nadie pueda acceder físicamente a los datos sin el código.

## [2.1.0] - 2026-04-18
### ✨ Inteligencia Artificial y Glotización Natural
- **Bot Políglota**: Evolución del ChatBot de español-único a un motor NLP en 5 idiomas (EN, ES, PT, IT, FR).
- **Auto-Conversión en Chat**: Antes el bot solo registraba montos nominales; ahora detecta si hablas en dólares, euros o reales y los convierte en tiempo real al balance base de tu app.

## [2.0.5] - 2026-04-18
### 📐 Auditoría de Diseño y Responsividad
- **Navegación Grid**: Rediseño de la barra de navegación para usar un sistema de rejilla (Grid-5) que garantiza alineación perfecta en dispositivos desde 320px.
- **Ultra-Wide Support**: Optimización del layout para monitores de hasta 2000px con contenedores centrados (`max-w-7xl`).
- **Accesibilidad**: Mejora del contraste de textos secundarios y descripción de sistema para cumplir con estándares modernos de legibilidad.

## [2.0.0] - 2026-04-18
### 🚀 Professionalization Milestone
- **Settings 2.0**: Migración de la sección de ajustes de un BottomSheet a una página completa dedicada (`/settings`).
- **Sistema i18n**: Implementación de arquitectura internacional para soporte de múltiples idiomas.
- **Divisas en Tiempo Real**: Integración de API de tipos de cambio para conversión dinámica de todos los balances del sistema.
- **Onboarding Premium**: Nuevo flujo de bienvenida inmersivo para configuración inicial de usuario.
- **Soberanía de Datos**: Implementación visual y técnica del claim de privacidad "Local & Privado".

## [1.5.0] - 2026-04-15
### 📊 Finanzas Avanzadas
- **Seguimiento de Cuotas**: Implementación de barras de progreso visuales para deudas y pagos financiados.
- **Recordatorios Recurrentes**: Soporte para tareas diarias y notificaciones de vencimiento.
- **Global Add Modal**: Unificación de registros (Gastos, Deudas, Recordatorios) en un único punto de entrada global.

## [1.0.0] - 2026-04-14
### 🎉 Initial Release
- **Core Dashboard**: Visualización de balances y gastos mensuales.
- **Gestión de Transacciones**: CRUD básico de ingresos y egresos.
- **ChatBot Core**: Parser inicial de lenguaje natural (Español).
- **Almacenamiento Local**: Integración con Dexie.js para persistencia Offline.

---

## 📝 Resumen para LinkedIn (Copy-Paste)
> **🚀 FinanzApp v2.2.0 - Soberanía Financiera Total**
> 
> Hoy implementamos cambios críticos para transformar esta app en una herramienta global:
> 🌎 Soporte para 5 idiomas y conversión de divisas en tiempo real (vía API).
> 🤖 ChatBot con NLP Multilingüe que entiende gastos en cualquier moneda.
> 🔒 Capa de seguridad biométrica y PIN para proteger datos locales.
> 📐 Auditoría responsiva completa: la app se ve impecable desde un celular de 320px hasta monitores de 2000px.
> 
> #Fintech #React #NextJS #PWA #OpenSource

---
*FinanzApp - Tu Soberanía Financiera, Local y Privada.*

## [Próximamente]
- [ ] Implementación de gráficas avanzadas por categoría.
- [ ] Soporte para exportación completa a Excel/PDF.
- [ ] Modo offline con Service Workers mejorados.
