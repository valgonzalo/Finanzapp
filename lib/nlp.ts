import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './constants';

export type ParsedTransaction = {
  type: 'income' | 'expense' | 'debt' | 'reminder';
  amount: number;
  category: string;
  description: string;
  personName?: string;
  date?: string;
};

export function parseNaturalLanguage(input: string): ParsedTransaction | null {
  // Pre-process: Handle thousands separators (20.000 or 20,000 -> 20000)
  const text = input.toLowerCase()
    .replace(/(\d+)[.,](\d{3})(?!\d)/g, '$1$2')
    .replace(/(\d+)[.,](\d{3})[.,](\d{3})(?!\d)/g, '$1$2$3');
  
  // 1. Detect Amount
  let amount = 0;
  const priceMatch = text.match(/\$\s?(\d+([.,]\d+)?)/) || text.match(/(\d+([.,]\d+)?)\s?(?:pesos|eur|usd|dolares)/);
  if (priceMatch) {
    amount = parseFloat(priceMatch[1].replace(',', '.'));
  } else {
    const genericMatch = text.match(/(?<!a las |vence el |el |día )(\d+([.,]\d+)?)(?!\s?hs|am|pm| de )/);
    if (genericMatch) {
       amount = parseFloat(genericMatch[1].replace(',', '.'));
    }
  }

  // 2. Detect Type (with better synonyms)
  let type: 'income' | 'expense' | 'debt' | 'reminder' = 'expense';
  
  const incomeKeywords = ['ingrese', 'gano', 'recibi', 'cobre', 'me pagaron', 'me dieron', 'tengo', 'ingreso', 'entrada', 'entro', 'ingresaron', 'me entro', 'me ingresaron'];
  const debtKeywords = ['deben', 'prest', 'deuda', 'debo', 'me debe'];
  const reminderKeywords = ['recordar', 'aviso', 'avisame', 'acordar', 'haceme acordar'];
  const expenseKeywords = ['gaste', 'pague', 'gasto', 'compre', 'pago', 'compre', 'merqué'];

  if (incomeKeywords.some(k => text.includes(k))) {
    type = 'income';
  } else if (debtKeywords.some(k => text.includes(k))) {
    type = 'debt';
  } else if (reminderKeywords.some(k => text.includes(k))) {
    type = 'reminder';
  } else if (expenseKeywords.some(k => text.includes(k))) {
    type = 'expense';
  }

  // 3. Detect Category
  let category = type === 'income' ? 'other' : 'other';
  
  const keywordMap: Record<string, string[]> = {
    tech: ['celular', 'computadora', 'notebook', 'teclado', 'monitor', 'mouse', 'gadget', 'software', 'ram', 'memoria', 'disco', 'ssd', 'cpu', 'procesador', 'placa de video', 'gpu', 'motherboard', 'placa base', 'hardware', 'tecnologia', 'tableta', 'ipad', 'laptop', 'pc', 'iphone', 'android'],
    clothing: ['ropa', 'zapatillas', 'jean', 'remera', 'camisa', 'campera', 'indumentaria', 'local de ropa', 'pantalon', 'abrigo', 'calzado'],
    food: ['comida', 'carne', 'super', 'coto', 'jumbo', 'carrefour', 'dia', 'chino', 'almuerzo', 'cena', 'restaurante', 'bebida', 'gaseosa', 'agua', 'galletitas', 'papas fritas', 'snack', 'papas', 'golosinas', 'mc donalds', 'burger', 'pan', 'leche', 'verdura'],
    transport: ['nafta', 'combustible', 'uber', 'taxi', 'sube', 'bondi', 'colectivo', 'estacionamiento', 'viaje', 'auto', 'mecanico'],
    services: ['luz', 'agua', 'gas', 'internet', 'fibertel', 'personal', 'movistar', 'claro', 'gym', 'gimnasio', 'expensas', 'seguro', 'patente', 'alquiler'],
    health: ['farmacia', 'remedio', 'medico', 'clinica', 'dentista', 'obra social', 'hospital'],
    home: ['muebles', 'decoracion', 'articulos de hogar', 'ferreteria', 'pintura'],
    entertainment: ['cine', 'salida', 'netflix', 'spotify', 'juego', 'gaming', 'steam', 'playstation', 'teatro', 'recital', 'concierto', 'ps4', 'ps5', 'xbox', 'nintendo', 'disney+', 'hbo', 'star+', 'prime video', 'pelicula', 'show'],
    education: ['curso', 'universidad', 'escuela', 'colegio', 'libros', 'utiles'],
    salary: ['sueldo', 'cobro', 'pago quincena', 'nomina', 'aguinaldo'],
    freelance: ['ludus', 'proyecto', 'cliente', 'web', 'freelance', 'trabajo']
  };

  for (const [catId, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(k => text.includes(k))) {
      category = catId;
      break;
    }
  }

  // If no keyword matched, check original labels
  if (category === 'other') {
    const allCats = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    for (const cat of allCats) {
      if (text.includes(cat.label.toLowerCase())) {
        category = cat.id;
        break;
      }
    }
  }

  // 4. Detect Person Name (for debts)
  let personName = '';
  if (type === 'debt') {
    const personMatch = text.match(/(?:de|a|me debe)\s+([a-zñáéíóú]+)(?:\s|$)/i);
    if (personMatch) personName = personMatch[1].charAt(0).toUpperCase() + personMatch[1].slice(1);
    else personName = 'Alguien';
  }

  // 5. Build Description
  let cleanDesc = input;
  const stopWords = [...incomeKeywords, ...debtKeywords, ...reminderKeywords, ...expenseKeywords, 'un ', 'una ', 'el ', 'la ', 'en ', 'por '];
  
  // Try to find the description after the trigger word
  let foundDesc = '';
  const parts = input.split(/\s+/);
  let triggerIndex = -1;
  
  for (let i = 0; i < parts.length; i++) {
    if (stopWords.some(sw => parts[i].toLowerCase().includes(sw))) {
      triggerIndex = i;
      break;
    }
  }

  if (triggerIndex !== -1) {
    foundDesc = parts.slice(triggerIndex + 1).join(' ').replace(/\d+([.,]\d+)?/g, '').trim();
  }

  if (!foundDesc) {
    foundDesc = input.replace(/\d+([.,]\d+)?/g, '').trim();
  }

  // Final cleanup: remove trailing/leading punctuation
  foundDesc = foundDesc.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
  foundDesc = foundDesc.charAt(0).toUpperCase() + foundDesc.slice(1);

  return {
    type,
    amount,
    category,
    description: foundDesc || (type === 'expense' ? 'Gasto rápido' : 'Registro rápido'),
    personName,
    date: new Date().toISOString().split('T')[0]
  };
}
