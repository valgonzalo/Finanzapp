import {
  Utensils,
  Car,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Zap,
  Shirt,
  Home,
  Laptop,
  MoreHorizontal,
  Briefcase,
  Code,
  TrendingUp,
  Gift,
  Users
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Comida', icon: Utensils },
  { id: 'transport', label: 'Transporte', icon: Car },
  { id: 'entertainment', label: 'Entretenimiento', icon: Gamepad2 },
  { id: 'health', label: 'Salud', icon: HeartPulse },
  { id: 'education', label: 'Educación', icon: GraduationCap },
  { id: 'services', label: 'Servicios', icon: Zap },
  { id: 'clothing', label: 'Ropa', icon: Shirt },
  { id: 'home', label: 'Hogar', icon: Home },
  { id: 'tech', label: 'Tecnología', icon: Laptop },
  { id: 'other', label: 'Otro', icon: MoreHorizontal },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Sueldo', icon: Briefcase },
  { id: 'freelance', label: 'Freelance', icon: Code },
  { id: 'investment', label: 'Inversión', icon: TrendingUp },
  { id: 'gift', label: 'Regalo', icon: Gift },
  { id: 'debt_collected', label: 'Deuda cobrada', icon: Users },
  { id: 'other', label: 'Otro', icon: MoreHorizontal },
];
