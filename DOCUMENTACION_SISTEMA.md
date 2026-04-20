# 📘 Documentación Completa del Sistema: FinanzApp

Este documento proporciona una visión detallada de todas las funcionalidades, arquitectura y diseño de **FinanzApp**. Su propósito es servir como base para el análisis de nuevas funcionalidades y mejoras para el cliente.

---

## 1. Filosofía y Core del Sistema
**FinanzApp** es una solución de soberanía financiera personal.
- **Offline-First**: Funciona sin conexión a internet. Los datos residen exclusivamente en el dispositivo del usuario.
- **Privacidad Total**: No hay servidores intermedios; la base de datos es local (IndexedDB).
- **Premium UX**: Diseño de alta fidelidad con animaciones fluidas y micro-interacciones.

---

## 2. Módulos y Funcionalidades Principales

### 📊 Dashboard (Panel de Control)
- **Visualización de Balances**: Resumen en tiempo real de Ingresos, Egresos y Saldo Neto.
- **Gráficos Dinámicos**: Gráficos de torta (Pie Charts) para distribución de gastos por categoría.
- **Accesos Rápidos**: Tarjetas con filtrado automático de transacciones.
- **Estado de Salud Financiera**: Indicadores visuales basados en el balance del mes actual.

### 💸 Gestión de Transacciones
- **Registro de Ingresos/Egresos**: CRUD completo de movimientos financieros.
- **Categorización Inteligente**: Asignación automática de categorías (comida, transporte, servicios, etc.).
- **Historial Completo**: Lista cronológica de movimientos con filtros avanzados.

### 💳 Gestión de Deudas y Cuotas
- **Control de Acreedores/Deudores**: Seguimiento de quién debe dinero y a quién se le debe.
- **Barras de Progreso**: Visualización del estado de pago de deudas.
- **Soporte para Cuotas**: Gestión de pagos financiados con seguimiento de progreso por cuota.

### 🔔 Recordatorios e Impuestos
- **Agenda de Vencimientos**: Registro de pagos recurrentes o únicos.
- **Recurrencia Configurable**: Soporte para recordatorios diarios, semanales o mensuales.
- **Notificaciones PWA**: Alertas locales en el dispositivo para evitar olvidos.

---

## 3. Inteligencia y Globalización

### 🤖 FinanzBot (Motor NLP)
- **Registro por Lenguaje Natural**: Permite escribir o dictar comandos como *"Gaste 5000 en pizza"* o *"Recibí 50000 de sueldo"*.
- **Multilingüe**: El motor entiende comandos en 5 idiomas: **Español, Inglés, Portugués, Italiano y Francés**.
- **Detección Automática**: Identifica monto, categoría y descripción sin formularios manuales.

### 🌍 Sistema Multidivisa
- **Conversión en Tiempo Real**: Integración con API de tipos de cambio.
- **Detección de Moneda en Chat**: El bot convierte automáticamente montos en USD, EUR o BRL a la moneda base de la aplicación.
- **Soporte Global**: Configuración de moneda local desde los ajustes.

---

## 4. Seguridad y Acceso
- **Protección por PIN**: Bloqueo obligatorio con código de 4 dígitos configurado en el Onboarding.
- **Sesión de Bloqueo Automático**: La aplicación se bloquea cada vez que se minimiza, recarga o cierra, protegiendo los datos de miradas indiscretas.
- **Onboarding Inmersivo**: Flujo de bienvenida premium para la configuración inicial de seguridad y preferencias.

---

## 5. Arquitectura Técnica
- **Frontend**: Next.js 15 (App Router) + React 19.
- **Estilos**: Tailwind CSS 4.0 con sistema de diseño "Dark Premium".
- **Persistencia**: Dexie.js (IndexedDB) para almacenamiento local robusto.
- **Animaciones**: Framer Motion para transiciones de estado y modales.
- **PWA**: Configuración de Web Manifest y Service Workers para instalación como App nativa.

---

## 6. Componentes de UI Globales
- **Global Registration Modal**: Único punto de entrada para añadir Gastos, Deudas o Recordatorios desde cualquier pantalla.
- **Navegación Grid-5**: Barra inferior optimizada para movilidad y alineación perfecta.
- **Ajustes 2.0**: Panel completo de configuración para i18n, seguridad y preferencias de visualización.

---

## 🚀 Análisis de Futuras Adiciones (Ideas para el Cliente)

Basado en el estado actual, estas son algunas sugerencias para escalar el sistema:

1.  **📈 Proyecciones de Ahorro**: Un módulo que calcule cuánto puede ahorrar el usuario basándose en su promedio de gastos de los últimos 3 meses.
2.  **📄 Exportación Profesional**: Generación de reportes en PDF o Excel para contadores o archivo personal.
3.  **📸 Scanner de Recibos (OCR)**: Integración de cámara para leer tickets y cargarlos automáticamente vía FinanzBot.
4.  **🎯 Objetivos de Ahorro (Piggy Bank)**: Crear metas específicas (ej: "Viaje a Europa") y asignar excedentes de ingresos a esos objetivos.
5.  **🔄 Sincronización en la Nube (Opcional/Cifrada)**: Implementar una opción de respaldo en Google Drive o Dropbox (manteniendo la privacidad) para no perder datos si se rompe el celular.
6.  **🏦 Conciliación Bancaria**: Importación de resúmenes de cuenta (CSV) para cruzar datos con el registro manual.
7.  **📉 Gráficos de Tendencias**: Comparativa mes a mes para ver si el gasto en categorías específicas está subiendo o bajando.
