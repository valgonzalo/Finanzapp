# Changelog - FinanzApp

Historial de cambios y evolución del sistema.

## [2.5.0] - 2026-04-20

### 🎨 Refinamiento de UX y Soporte Directo

- **Onboarding Inteligente**: Selección de idioma como primer paso, permitiendo que todo el flujo de bienvenida se traduzca en tiempo real según la preferencia del usuario.
- **Grilla de Divisas Optimizada**: Rediseño del selector de moneda para mostrar todas las opciones en una sola vista, eliminando el scroll en el onboarding.
- **Seguridad Inmersiva**: Rediseño de la pantalla de "Cambio de PIN" a pantalla completa (Full-screen) utilizando **React Portals** para evitar recortes de viewport.
- **Soporte Directo vía WhatsApp**: Integración de botón de contacto directo con el desarrollador con mensaje pre-configurado desde la sección de ajustes.
- **Acceso Rápido a FinanzBot**: Nuevo botón flotante (FAB) dedicado para abrir el chatbot desde cualquier pantalla.

## [2.3.0] - 2026-04-18

### 🛡️ Seguridad Obligatoria y Bloqueo de Sesión

- **Onboarding Seguro**: El proceso de bienvenida ahora exige la creación de un PIN de 4 dígitos. Antes era opcional en ajustes; ahora es el estándar de seguridad.
- **Auto-Bloqueo de Sesión**: Implementación de restauración automática de sesión con bloqueo inmediato. Cada vez que abras o recargues la app, el sistema pedirá tu PIN antes de revelar cualquier información.
- **Teclado Numérico en Onboarding**: Integrado un numpad táctil en el flujo inicial para una configuración de seguridad fluida.

## [2.2.0] - 2026-04-18

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

*FinanzApp - Tu Soberanía Financiera, Local y Privada.*

## [Próximamente]
- [ ] Implementación de gráficas avanzadas por categoría.
- [ ] Soporte para exportación completa a Excel/PDF.
- [ ] Modo offline con Service Workers mejorados.
