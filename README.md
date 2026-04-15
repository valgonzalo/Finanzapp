# FinanzApp 💰

**FinanzApp** es una aplicación de gestión de finanzas personales diseñada para ofrecer simplicidad, privacidad y control total sobre tus movimientos financieros.

## 🤔 ¿Por qué FinanzApp?

Esta aplicación nació de la necesidad de tener una herramienta financiera que sea:

- **Privada por Diseño**: Tus datos financieros son sensibles. FinanzApp no guarda nada en la nube por defecto; todo se almacena localmente en tu dispositivo.
- **Rápida e Intuitiva**: Diseñada para registrar gastos o ingresos en segundos, sin fricciones.
- **Enfocada en lo Importante**: No solo registra transacciones, sino que ayuda a gestionar deudas (quién te debe) y recordatorios de pagos semanales.

## 🛠️ ¿Cómo está desarrollado? (Stack Tecnológico)

La aplicación utiliza tecnologías modernas para garantizar una experiencia fluida y una interfaz premium:

- **Framework**: [Next.js 15](https://nextjs.org/) con React 19 para una base robusta y escalable.
- **Base de Datos**: [Dexie.js](https://dexie.org/) (IndexedDB). Esto permite que la app funcione offline y mantenga los datos seguros localmente.
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/) para un diseño moderno, responsivo y con efectos de "glassmorphism".
- **Animaciones**: [Motion](https://motion.dev/) (Framer Motion) para micro-interacciones y transiciones suaves.
- **Visualización**: [Recharts](https://recharts.org/) para gráficos interactivos de gastos por categoría.
- **Iconografía**: [Lucide React](https://lucide.dev/) para iconos consistentes y claros.
- **Tipografía**: Urbanist (Google Fonts) para una lectura premium.

## ✨ Características Principales

- **Dashboard Inteligente**: Resumen mensual de ingresos, gastos y balance neto.
- **Gestión de Transacciones**: Categorización de gastos e ingresos.
- **Control de Deudas**: Seguimiento detallado de personas que te deben dinero, incluyendo pagos parciales.
- **Recordatorios**: Sistema de avisos para pagos o cobros próximos.
- **Offline First**: Acceso total sin conexión a internet.

## 🚀 Instalación y Ejecución

**Prerrequisitos:** Node.js (v18+)

1. **Clonar el repositorio**
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Configurar variables de entorno**:
   Crea un archivo `.env.local` basado en `.env.example`.
4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

---

Desarrollado con enfoque en la experiencia de usuario y la privacidad de datos.
